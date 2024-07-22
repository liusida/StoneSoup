import torch

class GlobalCache:
    cache = {}
    
    @staticmethod
    def set(id, name, value):
        if id not in GlobalCache.cache:
            GlobalCache.cache[id] = {}
        GlobalCache.cache[id][name] = value

    @staticmethod
    def get(id, name):
        if id in GlobalCache.cache and name in GlobalCache.cache[id]:
            return GlobalCache.cache[id][name]
        return None
    
    @staticmethod
    def list():
        ret = []
        for id in GlobalCache.cache:
            for name in GlobalCache.cache[id]:
                obj = GlobalCache.cache[id][name]
                if hasattr(obj, 'patcher'):
                    obj = obj.patcher
                if obj.__class__.__qualname__ == 'ModelPatcher':
                    # memory_required = obj.memory_required()
                    pass

                ret.append({"id": id, "name": name})
        return ret
    
    @staticmethod
    def free():
        GlobalCache.cache = {}

    @staticmethod
    def free_comfyui():
        return

    @staticmethod
    def print_object(obj, indent=0):
        spacing = ' ' * indent
        if isinstance(obj, dict):
            for key, value in obj.items():
                print(f"{spacing}{key}:")
                GlobalCache.print_object(value, indent + 4)  # Recursive call for dict values
        elif isinstance(obj, list):
            for index, item in enumerate(obj):
                print(f"{spacing}[{index}]:")
                GlobalCache.print_object(item, indent + 4)  # Recursive call for list items
        elif hasattr(obj, '__dict__'):
            for key, value in vars(obj).items():
                print(f"{spacing}{key}:")
                GlobalCache.print_object(value, indent + 4)  # Recursive call for object attributes
        else:
            print(f"{spacing}{obj}")  # Base case: print the attribute value
