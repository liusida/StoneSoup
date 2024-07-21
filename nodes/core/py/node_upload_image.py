import os
import time
import random
import string
from PIL import Image
import numpy as np
import torch
from fastapi import FastAPI, File, Form, UploadFile
from server.py.global_settings import GlobalSettings
from server.py.cache import GlobalCache

app = FastAPI()

def generate_random_filename(extension: str) -> str:
    timestamp = time.strftime("%Y%m%d%H%M%S")
    random_string = ''.join(random.choices(string.ascii_letters + string.digits, k=4))
    return f"{timestamp}_{random_string}.{extension}"

def process_image(file_path: str) -> torch.Tensor:
    with Image.open(file_path) as img:
        if img.mode != 'RGB':
            img = img.convert('RGB')
        image_array = np.array(img).astype(np.float32) / 255.0
        image_tensor = torch.from_numpy(image_array)[None, ...].to(GlobalSettings.device)  # Shape: [1, H, W, C]
        return image_tensor

@app.post("/upload")
async def post_upload(id: str = Form(...), file: UploadFile = File(...)):
    # Save the uploaded file
    file_extension = file.filename.split('.')[-1]
    new_filename = generate_random_filename(file_extension)
    file_location = os.path.join(GlobalSettings.input_dir_physical, new_filename)

    with open(file_location, "wb") as f:
        f.write(await file.read())
    
    image_tensor = process_image(file_location)
    GlobalCache.set(id, "uploaded_image", image_tensor)

    return {"id": id, "name": "uploaded_image", "pointer": "object", "filename": new_filename}
