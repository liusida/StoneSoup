import { LGraphNode } from "/litegraph/src/lgraphnode.js";

LGraphNode.prototype.onChange = (node) => {
    node.complete = false;
    for (let slot=0; slot<node.outputs.length; slot++) {
        var next_nodes = node.getOutputNodes(slot);
        if (next_nodes && next_nodes.length>0) {
            next_nodes.forEach((next_node) => {
                if (next_node && next_node.complete) {
                    next_node.complete = false;
                    next_node.onChange(next_node);
                }
            })
        }
    }
}