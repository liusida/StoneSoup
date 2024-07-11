class ConstInteger:
    def __init__(self):
        pass
    
    @classmethod
    def INPUTS(s):
        return [
            # name, type, extra_info
            {"name": "base", "type": "number"}
        ]
    
    @classmethod
    def WIDGETS(s):
        return [
            # type, name, value, callback, options
            {"type": "number", "name": "value", "value": 1}
        ]

    @classmethod
    def OUTPUTS(s):
        return [
            {"name": "output", "type": "INT"}
        ]
    
    TITLE = "Server-side Integer"
    FUNCTION = "exec"

    def exec(self, int_value):
        return (int_value,)
