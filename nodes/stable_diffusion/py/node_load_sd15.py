import os
import yaml
import torch
import safetensors.torch
from server.py.node_template import NodeTemplate
from server.py.global_settings import GlobalSettings

class NodeLoadSD15 (NodeTemplate):
    title = "Load SD15"
    desc = "Load Stable Diffusion 1.5 or its fine-tunes"
    models_yml = os.path.join(os.path.dirname(__file__), '..', 'models.yml')
    model_mappings = {}

    def __init__(self):
        pass

    @classmethod
    def WIDGETS(cls):
        allowed_extensions = [".safetensors"]
        allowed_subfolders = ["SD15"]
        models_dir = GlobalSettings.models_dir_physical
        all_display_names = []

        for root, dirs, files in os.walk(models_dir):
            for subfolder in allowed_subfolders:
                if subfolder in root:
                    for file in files:
                        if any(file.endswith(ext) for ext in allowed_extensions):
                            model_path = os.path.join(root, file)
                            yml_path = os.path.splitext(model_path)[0] + ".yml"
                            
                            if os.path.exists(yml_path):
                                with open(yml_path, 'r') as yml_file:
                                    yml_content = yaml.safe_load(yml_file)
                                    display_name = yml_content.get('display_name')
                                    
                                    if display_name:
                                        cls.model_mappings[display_name] = model_path
                                        all_display_names.append(display_name)



        return [
            # type, name, value, callback, options
            {"type": "combo", "name": "model", "value": all_display_names}
        ]
    
    @classmethod
    def OUTPUTS(s):
        return [
            {"name": "UNet", "type": "UNET"},
            {"name": "CLIP", "type": "CLIP"},
            {"name": "VAE", "type": "VAE"},
        ]
    
    def main(self, model):
        model_display_name = model
        model_path = self.model_mappings[model]

        print(f"loading model {model_path}")

        # Load the model using torch
        try:
            model_data = safetensors.torch.load_file(model_path, device=GlobalSettings.device.type)
            print("Model loaded successfully")
            
            unet_keys = [key for key in model_data.keys() if key.startswith('model.diffusion_model')]
            clip_keys = [key for key in model_data.keys() if key.startswith('cond_stage_model')]
            vae_keys = [key for key in model_data.keys() if key.startswith('first_stage_model')]
            
            unet = {key: model_data[key] for key in unet_keys}
            clip = {key: model_data[key] for key in clip_keys}
            vae = {key: model_data[key] for key in vae_keys}
            
            return unet, clip, vae
        
        except Exception as e:
            print(f"Failed to load the model: {e}")
            return None, None, None

