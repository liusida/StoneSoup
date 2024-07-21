import os
import uuid
import time
import json
from io import BytesIO
from PIL import Image
import numpy as np
import torch
from fastapi import FastAPI, Query, File, Form, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from server.py.global_settings import GlobalSettings
from server.py.cache import GlobalCache

app = FastAPI()

def save_image_tensor(image_tensor, file_path):
    # Assuming image_tensor is a torch tensor with shape [1, H, W, C]
    image_array = image_tensor.squeeze(0).cpu().numpy()
    image_pil = Image.fromarray(np.uint8(image_array * 255))
    image_pil.save(file_path) # this line is super slow for a large image, why? is it because the original file before storing as tensor is JPG??

def get_image_bytes(image_tensor):
    # Assuming image_tensor is a torch tensor with shape [1, H, W, C]
    image_array = image_tensor.squeeze(0).cpu().numpy()
    image_pil = Image.fromarray(np.uint8(image_array * 255))
    image_bytes = BytesIO()
    image_pil.save(image_bytes, format='PNG')
    image_bytes.seek(0)
    return image_bytes

@app.get("/preview")
async def get_preview(image_pointer: str = Query(..., description="The image pointer in the format 'id__name'")):
    image_pointer = json.loads(image_pointer)
    start_time = time.time()  # Record the start time
    id, name = image_pointer["id"], image_pointer["name"]
    image_tensor = GlobalCache.get(id, name) # [1, H, W, C]
    # save a tmp image 
    if image_tensor is None:
        return {"error": "Image not found in cache"}

    _, height, width, channel = image_tensor.shape

    headers = {
        "X-Image-Width": str(width),
        "X-Image-Height": str(height)
    }

    filename = f"{uuid.uuid4()}.png"
    save_image_tensor(image_tensor, f"{GlobalSettings.temp_dir_physical}/{filename}")
    
    end_time = time.time()  # Record the end time
    duration = end_time - start_time  # Calculate the duration
    print(f"get_preview execution time: {duration:.2f} seconds")  # Log the duration

    return {"url": f"{GlobalSettings.temp_dir}/{filename}", "headers": headers}
