import { LiteGraph } from "/litegraph/src/litegraph.js";

// == Node: Start ==
export class NodeStart {

    static title = "Start";
    static desc = "Start the workflow";

    constructor() {
        var that=this;
        this.addWidget("button","Start", null, function(v){
            graph.start();
            that.processCache();
            that.triggerSlot(0);
        }, {} );
        this.addOutput("onTrigger", LiteGraph.EVENT);
    }

    processCache() {
        graph._nodes.forEach(node => {
            console.log(node);
        });
    }
}
LiteGraph.registerNodeType("core/Start", NodeStart);
