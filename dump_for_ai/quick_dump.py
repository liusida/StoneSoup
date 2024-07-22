import os

def list_source_files(root_dir, exclude_dirs=None):
    if exclude_dirs is None:
        exclude_dirs = set()
    else:
        exclude_dirs = set(exclude_dirs)

    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Remove excluded directories
        dirnames[:] = [d for d in dirnames if d not in exclude_dirs]

        for filename in filenames:
            if filename.endswith(('.py', '.js')):
                file_path = os.path.join(dirpath, filename)
                print(f"{file_path}")
                continue
                # Print file contents
                with open(file_path, 'r') as file:
                    print("```")
                    print(file.read())
                    print("```")
                    print("-" * 50)  # Separator between files

# Example usage
root_directory = '.'
excluded_directories = ['lib', 'venv', 'dump_for_ai', '__pycache__', '.vscode']
list_source_files(root_directory, excluded_directories)