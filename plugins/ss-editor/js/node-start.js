import { LiteGraph } from "/litegraph/src/litegraph.js";

// == Start Node ==
export class StartNode {

    static title = "Start";
    static desc = "Start the workflow";

    constructor() {
        var that=this;
        this.addWidget("button","Start", null, function(v){
            graph.start();
            that.triggerSlot(0);
        }, {} );
        this.addOutput("", LiteGraph.EVENT);
    }
}
LiteGraph.registerNodeType("Start", StartNode);

