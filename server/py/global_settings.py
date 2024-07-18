import torch

# Determine the device (CPU, GPU with CUDA, or GPU with MPS)
if torch.cuda.is_available():
    device = torch.device("cuda")
elif torch.backends.mps.is_available():
    device = torch.device("mps")
else:
    device = torch.device("cpu")

class GlobalSettings:
    input_dir_physical = "server/input"
    input_dir = "/input"
    temp_dir_physical = "server/tmp"
    temp_dir = "/tmp"

    models_dir_physical = "server/models"

    device = device