from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

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
    node['title'] = ConstInteger.TITLE
    nodes.append(node)

    return nodes

class APIInput(BaseModel):
    api: str

@app.post("/api")
async def api(data: APIInput):
    print(data)
    print(data.api)
    # TODO: call that api's execution function and get result
    result = {
        "output": 0
    }
    return {"result": result}

class DoubleItInput(BaseModel):
    value: float

@app.post("/func/doubleit")
async def func_doubleit(data: DoubleItInput):
    result = data.value * 2  # Example function logic
    return {"result": result}

@app.get("/test")
async def test():
    print("get test")
    return {"result": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=6165, reload=True)