from fastapi import FastAPI, File, Form, UploadFile
import os
app = FastAPI()

@app.post("/upload")
async def post_upload(id: str = Form(...), file: UploadFile = File(...)):
    # Define the upload directory
    upload_dir = "./input"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save the uploaded file
    file_location = os.path.join(upload_dir, file.filename)
    with open(file_location, "wb") as f:
        f.write(await file.read())
    
    return {"info": f"file '{file.filename}' saved at '{file_location}'", "filename": file.filename, "id": id}
