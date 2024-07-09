document.addEventListener("DOMContentLoaded", function() {
    


    // Define the custom Python function node
    function PythonFunctionNode() {
        this.addInput("input", "number");
        this.addOutput("output", "number");
        this.addOutput("next", LiteGraph.EVENT);
        this.properties = { state: "IDLE" };
        // this.size = [300, 40];
    }

    PythonFunctionNode.title = "Python Function DoubleIt";

    PythonFunctionNode.prototype.onExecute = function() {
        console.log("Executing PythonFunctionNode" + this.properties.state);

        const inputValue = this.getInputData(0);
    
        switch (this.properties.state) {
            case "IDLE":
                if (inputValue !== undefined) {
                    this.properties.state = "FETCHING";
                    this.fetchData(inputValue);
                }
                break;
            case "FETCHING":
                // Do nothing, waiting for fetch to complete
                this.setOutputData(0, null);
                break;
            case "COMPLETED":
                this.setOutputData(0, this.result);
                this.properties.state = "IDLE";
                break;
        }
    };
    
    PythonFunctionNode.prototype.fetchData = function(inputValue) {
        fetch("http://localhost:8000/func/doubleit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ value: inputValue }),
        })
        .then(response => response.json())
        .then(data => {
            this.result = data.result;
            this.properties.state = "COMPLETED";
            this.graph.setDirtyCanvas(true, true);  // Request a redraw
            var event = new CustomEvent('operationComplete', { detail: this });
            window.dispatchEvent(event);
            this.triggerSlot(1);
    
        })
        .catch(error => {
            console.error("Error:", error);
            this.properties.state = "IDLE";
            this.graph.setDirtyCanvas(true, true);  // Request a redraw
        });
    };
    window.addEventListener('operationComplete', function(e) {
        graph.runStep();
    });
    LiteGraph.registerNodeType("custom/python_function", PythonFunctionNode);

    // Define the custom output display node
    function OutputDisplayNode() {
        this.addInput("input", "number");
        this.size = [140, 60]; // Increased height for better display
        this.value = null; // To store the input value
    }

    OutputDisplayNode.title = "Output Display";

    OutputDisplayNode.prototype.onExecute = function() {
        console.log("Executing output display.");
        const inputValue = this.getInputData(0);
        if (inputValue !== undefined) {
            this.value = inputValue; // Store the value to display it later
        }
    };

    // Draw the value inside the node
    OutputDisplayNode.prototype.onDrawForeground = function(ctx) {
        if (this.value !== null) {
            ctx.fillStyle = "#AAA";
            ctx.font = "20px Arial";
            ctx.fillText(this.value, this.size[0] * 0.5 - ctx.measureText(this.value).width * 0.5, this.size[1] * 0.5 + 10);
        }
    };

    LiteGraph.registerNodeType("custom/output_display", OutputDisplayNode);


    // Create an input node to provide an initial value
    function ConstantNumberNode() {
        this.addOutput("value", "number");
        this.size = [140, 40];
    }

    ConstantNumberNode.title = "Constant Number";

    ConstantNumberNode.prototype.onExecute = function() {
        console.log("Executing ConstantNumberNode.");
        this.setOutputData(0, 42);  // Example constant value
    };


    // LiteGraph.registerNodeType("basic/constant_number", ConstantNumberNode);

    // == Workflow ==
    const constantNode = LiteGraph.createNode("basic/const");
    constantNode.pos = [50, 200];
    const pythonNode = LiteGraph.createNode("custom/python_function");
    pythonNode.pos = [270, 200];
    const outputNode = LiteGraph.createNode("custom/output_display");
    outputNode.pos = [600, 200];

    // Add the nodes to the graph
    graph.add(constantNode);
    graph.add(pythonNode);
    graph.add(outputNode);

    // Connect the nodes
    constantNode.connect(0, pythonNode, 0);
    pythonNode.connect(0, outputNode, 0);


});
