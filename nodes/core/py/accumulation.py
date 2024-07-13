class NodeAccumulation:
    title = "Server-side Accumulation"
    desc = "Start from 0, add 1 each time, return the sum."

    def __init__(self):
        self.value = 0
    
    @classmethod
    def INPUTS(s):
        return [
        ]
    
    @classmethod
    def WIDGETS(s):
        return [
            # type, name, value, callback, options
            {"type": "number", "name": "inc", "value": 1}
        ]

    @classmethod
    def OUTPUTS(s):
        return [
            {"name": "output", "type": "number"}
        ]
    
    def main(self, inc):
        current_value = self.value
        self.value += inc
        print("main function called.")
        return (current_value,)
