from typing import Dict, Any
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import importlib

app = FastAPI()
g_nodes = {}

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

@app.get("/nodes")
async def get_nodes():
    nodes = []
    node = {}
    from nodes.core.py.const import ConstInteger
    node['inputs'] = ConstInteger.INPUTS()
    node['widgets'] = ConstInteger.WIDGETS()
    node['outputs'] = ConstInteger.OUTPUTS()
    node['type'] = f"core/{ConstInteger.__name__}"
    node['serverside_class'] = f"core.py.const.ConstInteger"
    node['title'] = ConstInteger.title
    node['desc'] = ConstInteger.desc
    nodes.append(node)

    return nodes

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
    if (data.node_uuid not in g_nodes):
        # create the node on server-side
        module_path, class_name = data.serverside_class.rsplit('.', 1)
        module = importlib.import_module(f"nodes.{module_path}")
        Class = getattr(module, class_name)
        instance = Class()
        g_nodes[data.node_uuid] = instance
    
    server_node = g_nodes[data.node_uuid]

    output = server_node.main(**data.input)

    return {"result": output}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=6165, reload=True)