import { LiteGraph } from "/litegraph/src/litegraph.js";

// == Node: Start ==
export class NodeStart {

    static title = "Start";
    static desc = "Start the workflow";

    constructor() {
        var that=this;
        this.addWidget("button","Start", null, function(v){
            graph.start();
            that.triggerSlot(0);
        }, {} );
        this.addOutput("onTrigger", LiteGraph.EVENT);
    }
}
LiteGraph.registerNodeType("core/Start", NodeStart);
