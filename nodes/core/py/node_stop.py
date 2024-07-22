from fastapi import FastAPI
from server.py.cache import GlobalCache

app = FastAPI()

@app.get("/free")
async def get_free():
    GlobalCache.free_comfyui()
    return {}