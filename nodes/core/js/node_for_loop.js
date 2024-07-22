import { NodeTemplate } from "/system/default/js/node.js";

class NodeForLoop extends NodeTemplate{
    constructor() {
        super();
        this.title = "ForLoop";
        this.addInput("onTrigger", LiteGraph.EVENT);
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
            this.getOutputNodes(3)?.map(node => node.onChange?.());
            this.setOutputData(3, this.index);
            this.index++;
            this.running = false;
            this.triggerSlot(1);
        } else {
            this.running = false;
            this.triggerSlot(2);
        }
    }
    
    async onAction(action, param, options, action_slot) {
        await super.onAction(action, param, options, action_slot);
        this.index = this.getWidgetValueByName("First Index");
        // find the Next node and add a callback
        var that=this;
        var next = this.getOutputNodes(0);
        if (next==null || next.length<=0) {
            ui.showMessageBox("Please connect to the ForLoopNext Node");
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
            ui.showMessageBox("Please connect to the ForLoop Node");
        }
    }
}
LiteGraph.registerNodeType("core/ForLoop", NodeForLoop);
LiteGraph.registerNodeType("core/ForLoopNext", NodeForLoopNext);
