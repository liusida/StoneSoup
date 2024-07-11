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