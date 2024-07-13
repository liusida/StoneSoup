import { LiteGraph } from "/litegraph/src/litegraph.js";
import { LGraphNode } from "/litegraph/src/lgraphnode.js";

class NodeForLoop {
    constructor() {
        this.title = "for (i=0; i<n; i++) { loop }";
        this.addInput("onTrigger", LiteGraph.EVENT);
        this.addInput("loop", LiteGraph.EVENT);
        this.addOutput("onTrigger", LiteGraph.EVENT);
        this.addOutput("i", "number", "0");
        this.addWidget("number", "n", 10).options.step = 10;
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
