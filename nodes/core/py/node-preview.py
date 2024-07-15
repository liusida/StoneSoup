import os
import uuid
from io import BytesIO
from PIL import Image
import numpy as np
import torch
from fastapi import FastAPI, File, Form, UploadFile
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

class PreviewRequest(BaseModel):
    image_pointer: str

@app.post("/preview")
async def post_preview(request: PreviewRequest):
    id, name = request.image_pointer.split("__")
    image_tensor = GlobalCache.get(id, name) # [1, H, W, C]
    # save a tmp image 
    if image_tensor is None:
        return {"error": "Image not found in cache"}

    _, height, width, channel = image_tensor.shape

    headers = {
        "X-Image-Width": str(width),
        "X-Image-Height": str(height)
    }
    print(headers)

    # Save the image tensor as an image file
    image_bytes = get_image_bytes(image_tensor)
    
    return StreamingResponse(image_bytes, media_type="image/png", headers=headers)
