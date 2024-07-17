// == Node: Example_Pure_JS ==
export class NodeExample_Pure_JS {

    static title = "Example_Pure_JS";
    static desc = "Example_Pure_JS";

    constructor() {
        var that=this;
        this.addInput("onTrigger", LiteGraph.EVENT);
        this.addWidget("button","Manual Trigger", null, function(v){
            that.triggerSlot(0);
        }, {} );
        this.addOutput("onTrigger", LiteGraph.EVENT);
    }

    onAction() { //automatically trigger
        this.triggerSlot(0);
    }
}
LiteGraph.registerNodeType("example_custom_nodes/Example_Pure_JS", NodeExample_Pure_JS);
