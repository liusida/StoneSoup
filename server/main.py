from typing import Any, Dict, List
from pathlib import Path
from importlib import import_module
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import traceback

# allow import from the project directory
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from server.py.node import Node

app = FastAPI()

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
)

def load_nodes_from_directory(directory: Path):
    # Loop over each Python file in the directory
    for file in directory.glob('*.py'):
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
            attr = getattr(module, attr_name)
            if isinstance(attr, type) and issubclass(attr, Node) and attr is not Node:  # Check if the attribute is a subclass of Node
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

def load_all_nodes():
    base_path = Path('./nodes')
    # Check each subdirectory in the nodes directory
    for pack_directory in base_path.iterdir():
        if pack_directory.is_dir():
            # Read each pack directory
            for sub_dir in pack_directory.iterdir():
                if sub_dir.is_dir() and sub_dir.name == 'py':
                    load_nodes_from_directory(sub_dir)




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
    print(data.serverside_class)
    print(data.input)
    print(data.node_uuid)
    # TODO: call that api's execution function and get result
    try:
        if (data.node_uuid not in running_nodes):
            # create the node on server-side
            module_path, class_name = data.serverside_class.rsplit('.', 1)
            module = import_module(module_path)
            Class = getattr(module, class_name)
            instance = Class()
            running_nodes[data.node_uuid] = instance
        
        server_node = running_nodes[data.node_uuid]

        output = server_node.main(**data.input)
        return {"result": output}
    except Exception as e:
        error_message = str(e)
        error_traceback = traceback.format_exc()
        print(error_traceback)  # Optionally log the traceback to server logs
        # Return a structured response containing the error message and traceback
        return {"error": error_message, "traceback": error_traceback}

app.mount("/input", StaticFiles(directory="server/input"), name="input")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=6165, reload=True)