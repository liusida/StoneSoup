import { LiteGraph } from "/litegraph/src/litegraph.js";

export class NodeVertical {

    static title = "";
    static desc = "";

    constructor() {
        this.horizontal = true;
        this.addInput("onTrigger", LiteGraph.EVENT);
        this.addOutput("onTrigger", LiteGraph.EVENT);
    }
    onAction() {
        this.triggerSlot(0);
    }
}
LiteGraph.registerNodeType("core/RerouteV", NodeVertical);
