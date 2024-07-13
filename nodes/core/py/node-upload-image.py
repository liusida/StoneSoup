from fastapi import FastAPI, File, UploadFile
import os
from server import app

@app.post("/upload")
async def post_upload(file: UploadFile = File(...)):
    # Define the upload directory
    upload_dir = "./input"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save the uploaded file
    file_location = os.path.join(upload_dir, file.filename)
    with open(file_location, "wb") as f:
        f.write(await file.read())
    
    return {"info": f"file '{file.filename}' saved at '{file_location}'", "filename": file.filename}
