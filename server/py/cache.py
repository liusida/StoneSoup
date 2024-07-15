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