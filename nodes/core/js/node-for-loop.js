import { LiteGraph } from "/litegraph/src/litegraph.js";
import { LGraphNode } from "/litegraph/src/lgraphnode.js";

class NodeForLoop {
    constructor() {
        this.title = "ForLoop";
        this.addInput("onTrigger", LiteGraph.EVENT);
        this.addInput("Break", LiteGraph.EVENT);
        this.addOutput("Next", "ForLoopID");
        this.addOutput("Loop Body", LiteGraph.EVENT);
        this.addOutput("Completed", LiteGraph.EVENT);
        this.addOutput("Index", "number", "0");
        this.addWidget("number", "First Index", 1).options.step = 10;
        this.addWidget("number", "Last Index", 3).options.step = 10;
        this.addWidget("number", "Step", 1).options.step = 10;
        this.index = 0;
    }

    getWidgetValueByName(widgetName) {
        if (!this.widgets) {
            return null;
        }
        for (let widget of this.widgets) {
            if (widget.name === widgetName) {
                return widget.value;
            }
        }
        return null;
    }

    step() {
        if (this.index<=this.getWidgetValueByName("Last Index")) {
            this.triggerSlot(1);
        } else {
            this.triggerSlot(2);
        }
        this.index++;
    }
    
    async onAction(action, param, options, action_slot) {
        this.index = this.getWidgetValueByName("First Index");
        // find the Next node and add a callback
        var that=this;
        var next = this.getOutputNodes(0);
        if (next==null || next.length<=0) {
            graphcanvas.createDialog("Please connect to the ForLoopNext Node");
            return;
        }
        next.forEach(node => {
            node.stepFunction = () => {
                that.step();
            }
        });
        that.step();
    }
}
class NodeForLoopNext {
    constructor() {
        this.title = "Next";
        this.addInput("ForLoop", "ForLoopID");
        this.addInput("Next", LiteGraph.EVENT);
        this.stepFunction = null;
    }
    async onAction(action, param, options, action_slot) {
        if (this.stepFunction) {
            this.stepFunction.call();
        } else {
            graphcanvas.createDialog("Please connect to the ForLoop Node");
        }
    }
}
LiteGraph.registerNodeType("core/ForLoop", NodeForLoop);
LiteGraph.registerNodeType("core/ForLoopNext", NodeForLoopNext);
