from typing import Any, Dict, List
from pathlib import Path
from importlib import import_module
import json
import torch
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from pydantic import BaseModel
import traceback

# allow import from the project directory
import sys, os, shutil
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from server.py.global_settings import GlobalSettings
from server.py.cache import GlobalCache
from server.py.node_template import NodeTemplate
from server.py.custom_logs import logging
logger = logging.getLogger("server")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-warm PyTorch operations
    dummy_array = np.array([0], dtype=np.float32)
    dummy_tensor = torch.from_numpy(dummy_array).to(GlobalSettings.device)
    logger.info("Pre-warming PyTorch completed.")
    if (len(all_nodes)==0):
        load_all_nodes()
        logger.info("All nodes loaded.")
    yield
    # Clean up the ML models and release the resources

app = FastAPI(lifespan=lifespan)

running_nodes = {}
# This list will store all node information
all_nodes: List[Dict[str, Any]] = []

# Define CORS settings
origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
    expose_headers=["X-Image-Width", "X-Image-Height"],  # Explicitly expose the custom headers

)

def load_nodes_from_file(file: Path, white_list=None):
    module_name = file.stem  # Get the module name without '.py'
    # Construct module path relative to the 'nodes' directory
    relative_module_path = '.'.join(file.parts)[:-3]

    # Import the module dynamically
    module = import_module(relative_module_path)

    # To add Routers (which can be thought of as a mini FastAPI application) to your main FastAPI app
    if hasattr(module, 'app') and isinstance(module.app, FastAPI):
        app.include_router(module.app.router)

    # Loop through each attribute in the module
    for attr_name in dir(module):
        if isinstance(white_list, List):
            if attr_name not in white_list:
                continue
        attr = getattr(module, attr_name)
        if isinstance(attr, type) and issubclass(attr, NodeTemplate) and attr is not NodeTemplate:  # Check if the attribute is a subclass of NodeTemplate
            node = {
                'inputs': attr.INPUTS() if hasattr(attr, 'INPUTS') else [],
                'widgets': attr.WIDGETS() if hasattr(attr, 'WIDGETS') else [],
                'outputs': attr.OUTPUTS() if hasattr(attr, 'OUTPUTS') else [],
                'type': f"{file.parent.parent.name}/{attr.__name__}",
                'serverside_class': f"{relative_module_path}.{attr_name}",
                'title': getattr(attr, 'title', ''),
                'desc': getattr(attr, 'desc', '')
            }
            all_nodes.append(node)
        if isinstance(attr, type) and hasattr(attr, "FUNCTION"):
            # Be compatible with ComfyUI nodes!
            if hasattr(module, "NODE_DISPLAY_NAME_MAPPINGS"):
                title = module.NODE_DISPLAY_NAME_MAPPINGS[attr.__name__]
            else:
                title = attr.__name__

            inputs = attr.INPUT_TYPES()["required"]
            inputs_list = []
            widgets_list = []

            for key, value in inputs.items():
                if len(value) > 0:
                    options = None
                    if isinstance(value[0], list):
                        widget_item = {"type": "combo", "name": key, "value": value[0]}
                        widgets_list.append(widget_item)
                    elif len(value) > 1 and isinstance(value[1], dict):
                        options = value[1]
                        if value[0]=="INT" or value[0]=="FLOAT":
                            widget_type = "number" #TODO: Widget type should support int!
                        else:
                            widget_type = value[0]
                        widget_item = {"type": widget_type, "name": key, "options": options}
                        widgets_list.append(widget_item)
                    else:
                        input_item = {"name": key, "type": value[0]}
                        inputs_list.append(input_item)

            outputs_list = []
            if hasattr(attr, 'RETURN_TYPES'):
                for item in attr.RETURN_TYPES:
                    outputs_list.append({"name": item, "type": item})
            node = {
                'inputs': inputs_list,
                'widgets': widgets_list,
                'outputs': outputs_list,
                'type': f"Comfy/{attr.__name__}",
                'serverside_class': f"{relative_module_path}.{attr_name}",
                'title': title,
                'desc': getattr(attr, 'desc', ''),
                'entrypoint': getattr(attr, 'FUNCTION', 'main'),
            }
            all_nodes.append(node)

def load_nodes_from_directory(directory: Path):
    # Loop over each Python file in the directory
    for file in directory.glob('*.py'):
        load_nodes_from_file(file)

def load_all_nodes():
    base_path = Path('./nodes')
    # Check each subdirectory in the nodes directory
    for pack_directory in base_path.iterdir():
        if pack_directory.is_dir():
            # Read each pack directory
            for sub_dir in pack_directory.iterdir():
                if sub_dir.is_dir() and sub_dir.name == 'py':
                    load_nodes_from_directory(sub_dir)
    
    # if `server/lib/ComfyUI/nodes.py` exists, load_nodes_from_directory(that)
    comfy_nodes_file_path = Path('./server/lib/ComfyUI/nodes.py')
    if comfy_nodes_file_path.exists():
        logger.info("Ha, we have a guest here! (Found ComfyUI)")
        sys.path.append(r'./server/lib/ComfyUI/')
        import folder_paths
        folder_paths.folder_names_and_paths["checkpoints"][0].append(os.path.abspath('./server/models/'))
        ckpts = folder_paths.get_filename_list("checkpoints")

        load_nodes_from_file(comfy_nodes_file_path, white_list=["CheckpointLoaderSimple", "CLIPTextEncode", "KSampler", "EmptyLatentImage", "VAEDecode"])

@app.get("/nodes")
async def get_nodes():
    if (len(all_nodes)==0):
        load_all_nodes()
    return all_nodes

class APIInput(BaseModel):
    node_uuid: str
    serverside_class: str
    input: Dict[str, Any]

@app.post("/api")
async def api(data: APIInput):
    try:
        if (data.node_uuid not in running_nodes):
            # create the node on server-side
            module_path, class_name = data.serverside_class.rsplit('.', 1)
            module = import_module(module_path)
            Class = getattr(module, class_name)
            instance = Class()
            running_nodes[data.node_uuid] = instance
        
        server_node = running_nodes[data.node_uuid]

        if hasattr(server_node, "download_assets"):
            # nodes that follow NodeTemplate have this function to download necessary assets including models
            server_node.download_assets()

        if hasattr(server_node, "FUNCTION"):
            # allow nodes to set entrypoint other than the default `main()` for compatibility
            func = getattr(server_node, server_node.FUNCTION)
        else:
            func = server_node.main

        temp = data.input
        for key, value in data.input.items():
            if isinstance(value, dict) and "pointer" in value and value["pointer"]=="object":
                data.input[key] = GlobalCache.get(value["id"], value["name"])

        with torch.inference_mode():
            # enter inference mode to speed up (and avoid "RuntimeError: a leaf Variable that requires grad is being used in an in-place operation."), no training allowed.
            output = func(**data.input)

        output = list(output)
        for i, obj in enumerate(output):
            if isinstance(obj, object):
                full_classname = f"{obj.__class__.__module__}.{obj.__class__.__qualname__}"
                GlobalCache.set(data.node_uuid, full_classname, obj)
                output[i] = {"id": data.node_uuid, "name": full_classname, "pointer": "object"} # TODO: save the object to cache and give a reference pointer to the client
        logger.info( json.dumps({"result": output}) )
        return {"result": output}
    except Exception as e:
        error_message = str(e)
        error_traceback = traceback.format_exc()
        logger.error(error_traceback)  # Optionally log the traceback to server logs
        # Return a structured response containing the error message and traceback
        return {"error": error_message, "traceback": error_traceback}

# Create folder for input if not exsits
os.makedirs(GlobalSettings.input_dir_physical, exist_ok=True)
app.mount(f"{GlobalSettings.input_dir}", StaticFiles(directory=f"{GlobalSettings.input_dir_physical}"), name="input")
# Recreate folder for temp
if os.path.exists(GlobalSettings.temp_dir_physical):
    shutil.rmtree(GlobalSettings.temp_dir_physical)
os.makedirs(GlobalSettings.temp_dir_physical, exist_ok=True)
app.mount(f"{GlobalSettings.temp_dir}", StaticFiles(directory=f"{GlobalSettings.temp_dir_physical}"), name="temp")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=6165, reload=True)