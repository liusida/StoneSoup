// == Node: Stop ==
export class NodeStop {

    static title = "Stop";
    static desc = "Stop the workflow";

    constructor() {
        this.addInput("onTrigger", LiteGraph.EVENT);
    }
    async onAction() {
        // offload all models to cpu
        const response = await fetch(`${server_url}/free`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });
        graph._nodes.map(node => node.complete = false);

        // TODO: do we need to clean cpu memory as well? but what if we refer to that variable later?

        // stop the graph, let the computer have a rest
        graph.stop();
    }
}
LiteGraph.registerNodeType("core/Stop", NodeStop);
