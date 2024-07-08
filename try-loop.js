function LoopControlNode() {
    this.addInput("trigger", LiteGraph.ACTION);
    this.addInput("N", "number");
    this.addInput("value", "number");
    this.addOutput("result", "number");
    this.addOutput("next", LiteGraph.EVENT);
    this.properties = { currentIteration: 0 };
}

LoopControlNode.title = "Loop Control";

LoopControlNode.prototype.onAction = function(action, param) {
    if (action !== "trigger") return;

    const N = this.getInputData(1);
    let value = this.getInputData(2);

    if (this.properties.currentIteration < N) {
        this.properties.currentIteration++;
        this.triggerSlot(0, value);
    } else {
        this.setOutputData(0, value);
        this.properties.currentIteration = 0;
    }
}

LiteGraph.registerNodeType("custom/LoopControl", LoopControlNode);

// Double It Node
function DoubleItNode() {
    this.addInput("in", "number");
    this.addOutput("out", "number");
}

DoubleItNode.title = "Double It";

DoubleItNode.prototype.onExecute = function() {
    const input = this.getInputData(0);
    if (input !== undefined) {
        this.setOutputData(0, input * 2);
    }
}

LiteGraph.registerNodeType("custom/DoubleIt", DoubleItNode);

// Create nodes
var nInput = LiteGraph.createNode("basic/const");
nInput.pos = [100, 100];
nInput.setValue(5); // Set N to 5

var valueInput = LiteGraph.createNode("basic/const");
valueInput.pos = [100, 200];
valueInput.setValue(2); // Initial value to be doubled

var loopControl = LiteGraph.createNode("custom/LoopControl");
loopControl.pos = [300, 150];

var doubleIt = LiteGraph.createNode("custom/DoubleIt");
doubleIt.pos = [500, 150];

var display = LiteGraph.createNode("basic/console");
display.pos = [700, 150];

// Add nodes to the graph
graph.add(nInput);
graph.add(valueInput);
graph.add(loopControl);
graph.add(doubleIt);
graph.add(display);

// Connect nodes
nInput.connect(0, loopControl, 1);
valueInput.connect(0, loopControl, 2);
loopControl.connect(0, doubleIt, 0);
doubleIt.connect(0, loopControl, 2);
loopControl.connect(1, display, 0);

// To run the graph
// function runGraph() {
//     loopControl.trigger("trigger");
//     graph.runStep();
//     requestAnimationFrame(runGraph);
// }

