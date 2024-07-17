from server.py.node_template import NodeTemplate

class NodeExamplePurePy (NodeTemplate):
    title = "NodeExamplePurePy"
    desc = ""

    def __init__(self):
        pass
    
    @classmethod
    def INPUTS(s):
        return [
        ]
    
    @classmethod
    def WIDGETS(s):
        return [
            # type, name, value, callback, options
            {"type": "number", "name": "number", "value": 1}
        ]

    @classmethod
    def OUTPUTS(s):
        return [
            {"name": "output", "type": "number"}
        ]
    
    def main(self, number):
        print("log to the terminal")
        return (number,)
