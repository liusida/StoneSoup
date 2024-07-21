export class NodeTemplate {
    constructor() {
        this.complete = false;
        this.running = false;
        this.serialize_widgets = true;
    }

    onChange() {
        this.complete = false;
        for (let slot = 0; slot < this.outputs.length; slot++) {
            var next_nodes = this.getOutputNodes(slot);
            if (next_nodes && next_nodes.length > 0) {
                next_nodes.forEach((next_node) => {
                    if (next_node && next_node.complete) {
                        next_node.complete = false;
                        next_node.onChange(next_node);
                    }
                });
            }
        }
    }

    onWidgetChanged() {
        this.onChange();
    }

    async onAction(action, param, options, action_slot) {
        this.running = true;
    }

    triggerNextNode() {
        this.complete = true;
        this.running = false;
        this.triggerSlot(0); // Trigger the next node
    }
}
