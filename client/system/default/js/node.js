export class NodeTemplate {
    constructor() {
        this.complete = false;
        this.running = false;
        this.serialize_widgets = true;
        this.hidden_widget_names = [];
    }

    onChange() {
        this.complete = false;
        if (this.subgraph) {
            for (const index in this.subgraph._nodes) {
                // reset all nodes in subgraph. TODO: might be better to check the link and reset the dedicated nodes.
                this.subgraph._nodes[index].complete = false;
            }
        }
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

    getExtraMenuOptions(_, options) {
        for (const w of this.widgets) {
            if (w.type == "number") {
                options.push({
                    content: `Convert ${w.name} to input`,
                    callback: () => this.convertToInput(w),
                });
            }
        }
    }

    hideWidget(widget_name) {
        const index = this.widgets.findIndex(item => item.name === widget_name);
        if (index !== -1) {
            var widget = this.widgets[index];
            widget.computeSize = () => [0, -4];
            widget.serializeValue = () => undefined;
            widget.hidden = true;
        }
    }

    convertToInput(widget) {
        // hide widget
        this.hidden_widget_names.push(widget.name);
        this.hideWidget(widget.name);
        // addInput
        this.addInput(widget.name, widget.type);
    }

    onSerialize(o) {
        o.hidden_widget_names = this.hidden_widget_names;
    }
    onConfigure(info) {
        this.hidden_widget_names = info.hidden_widget_names;
        // when restore the workflow, hide the widget again
        if (this.hidden_widget_names) {
            for (const widget_name of this.hidden_widget_names) {
                this.hideWidget(widget_name);
            }
        }
    }
}
