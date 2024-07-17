from fastapi import FastAPI, Query, File, Form, UploadFile

app = FastAPI()

@app.get("/example")
async def get_preview(name: str = Query(..., description="The image pointer in the format 'id__name'")):
    return {"string": f"hi {name}. hello from the server"}
