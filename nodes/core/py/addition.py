class NodeAddition:
    title = "Server-side Addition"
    desc = "Add the input `base` to widget `value`, return the sum."

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
    
    def main(self, base, value):
        output = base + value
        print("main function called.")
        return (output,)
