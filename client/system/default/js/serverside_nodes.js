import { NodeTemplate } from "./node.js";

// == Register Nodes ==
function registerServersideNodes(nodeData) {
    console.log(nodeData);
    class nodeClass extends NodeTemplate {
        constructor(title) {
            super();
            this.title = title;
            this.serverside_class = nodeData.serverside_class;
            this.shape = "card";

            //All server-side nodes contain this event trigger
            this.addInput("onTrigger", LiteGraph.EVENT);
            this.addOutput("onTrigger", LiteGraph.EVENT);

            if (nodeData.inputs) {
                nodeData.inputs.forEach((input) => {
                    this.addInput(input.name, input.type);
                });
            }

            if (nodeData.widgets) {
                nodeData.widgets.forEach((widget) => {
                    if (
                        widget.type == "combo" &&
                        widget.value.constructor == Array
                    ) {
                        this.addWidget(
                            widget.type,
                            widget.name,
                            widget.value[0],
                            null,
                            { values: widget.value }
                        );
                    } else {
                        console.log(widget.type);
                        var default_value;
                        if (widget.value) {
                            default_value = widget.value;
                        } else if (
                            widget.options &&
                            widget.options["default"]
                        ) {
                            default_value = widget.options.default;
                        } else {
                            if (widget.type == "STRING") default_value = "";
                            else if (widget.type == "number") default_value = 0;
                            else console.warn("Not implemented.");
                        }
                        this.addWidget(
                            widget.type,
                            widget.name,
                            default_value,
                            null,
                        );
                    }
                });
            }

            if (nodeData.outputs) {
                nodeData.outputs.forEach((output) => {
                    this.addOutput(output.name, output.type);
                });
            }
        }

        async onAction(action, param, options, action_slot) {
            await super.onAction(action, param, options, action_slot);
            if (this.complete) {
                this.triggerNextNode();
                return;
            }
            // Data to be sent to the server
            const data = {
                node_uuid: this.id,
                serverside_class: nodeData.serverside_class,
                input: {},
            };
            this.inputs?.forEach((item, slotIndex) => {
                if (item.type == LiteGraph.EVENT) return;
                data.input[item.name] = this.getInputData(slotIndex);
            });
            this.widgets?.forEach((item) => {
                if (!item.hidden) {
                    data.input[item.name] = item.value;
                }
            });
            var response = await fetch(`${server_url}/api`, {
                method: "POST", // Setting the method to POST
                headers: {
                    "Content-Type": "application/json", // Specifying the content type
                },
                body: JSON.stringify(data), // Converting the JavaScript object to a JSON string
            });
            var result = await response.json();
            if (result.result) {
                Object.entries(result.result).forEach(([slot, data]) => {
                    this.setOutputData(Number(slot) + 1, data); // +1 because the first slot is for the next EVENT
                });
                this.triggerNextNode();
            } else if (result.error) {
                console.log(result.error);
                ui.showMessageBox(
                    `<div id="error-dialog"><div><h1>${result.error}</h1></div><div><pre>${result.traceback}</pre></div></div>`,
                    { position: [100, 100] }
                );
            }
        }
    }
    nodeClass.title = nodeData.title || "Unnamed";
    nodeClass.desc = nodeData.desc || "No description";

    LiteGraph.registerNodeType(nodeData.type, nodeClass);
    nodeClass.onRegistered?.();
}

export async function initServersideNodes() {
    const response = await fetch(`${server_url}/nodes`);
    if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json(); // Parse the JSON from the response
    if (data.constructor == Array) {
        data.forEach((nodeData) => {
            registerServersideNodes(nodeData); // Process the data here
        });
    }
}

LiteGraph.registered_node_init_func = {};
LiteGraph.registerInitFunction = (type, func) => {
    LiteGraph.registered_node_init_func[type] = func;
};
LiteGraph.onNodeTypeRegistered = (type, base_class) => {
    if (LiteGraph.registered_node_init_func[type]) {
        // replace the base_class with the extended class
        LiteGraph.registered_node_types[type] =
            LiteGraph.registered_node_init_func[type](base_class);
    }
};
