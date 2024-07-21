// == Node: Stop ==
export class NodeStop {

    static title = "Stop";
    static desc = "Stop the workflow";

    constructor() {
        this.addInput("onTrigger", LiteGraph.EVENT);
    }
    async onAction() {
        graph.stop();
    }
}
LiteGraph.registerNodeType("core/Stop", NodeStop);
