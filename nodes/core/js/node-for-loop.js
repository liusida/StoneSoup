import { LiteGraph } from "/litegraph/src/litegraph.js";
import { LGraphNode } from "/litegraph/src/lgraphnode.js";

class NodeForLoop {
    constructor() {
        this.title = "ForLoop";
        this.addInput("onTrigger", LiteGraph.EVENT);
        this.addInput("Break", LiteGraph.EVENT);
        this.addOutput("Loop Body", LiteGraph.EVENT);
        this.addOutput("Completed", LiteGraph.EVENT);
        this.addOutput("Index", "number", "0");
        this.addWidget("number", "First Index", 1).options.step = 10;
        this.addWidget("number", "Last Index", 10).options.step = 10;
        this.addWidget("number", "Step", 1).options.step = 10;
        this.i = 0;
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
    
    async onAction(action, param, options, action_slot) {
        if (action_slot==0) { // for i=0
            this.i = 0;
        } else { // i++
            this.i ++;
        }
        this.setOutputData("i", this.i);
        if (this.i<this.getWidgetValueByName('n')) {
            this.triggerSlot(0);
        }
    }
}
LiteGraph.registerNodeType("core/ForLoop", NodeForLoop);
