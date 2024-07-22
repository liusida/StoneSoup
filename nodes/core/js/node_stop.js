// == Node: Stop ==
export class NodeStop {

    static title = "Stop";
    static desc = "Stop the workflow";

    constructor() {
        this.addInput("onTrigger", LiteGraph.EVENT);
    }
    async onAction() {
        const response = await fetch(`${server_url}/free`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });
        graph._nodes.map(node => node.complete = false);
        graph.stop();
    }
}
LiteGraph.registerNodeType("core/Stop", NodeStop);
