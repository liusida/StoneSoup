import { LiteGraph } from "/litegraph/src/litegraph.js";
import { StoneSoupEditor } from "./ss-editor.js";

// == Register Nodes ==
function registerServersideNodes(nodeData) {
    console.log(nodeData);
    const nodeClass = class extends LiteGraph.LGraphNode {
        constructor(title) {
            super(title);
            this.serverside_class = nodeData.serverside_class

            //All server-side nodes contain this event trigger
            this.addInput("", LiteGraph.EVENT);
            this.addOutput("next", LiteGraph.EVENT);

            if (nodeData.inputs) {
                nodeData.inputs.forEach((input) => {
                    this.addInput(input.name, input.type);
                });
            }

            if (nodeData.widgets) {
                nodeData.widgets.forEach((widget) => {
                    this.addWidget(widget.type, widget.name, widget.value);
                });
            }

            if (nodeData.outputs) {
                nodeData.outputs.forEach((output) => {
                    this.addOutput(output.name, output.type);
                });
            }
        }

        async onAction(event) {
            console.log("onAction");
            // Data to be sent to the server
            const data = {
                node_uuid: this.id,
                serverside_class: nodeData.serverside_class,
                input: {},
            };
            this.inputs.forEach((item, slotIndex)=>{
                if (item.type == LiteGraph.EVENT)
                    return;
                data.input[item.name] = this.getInputData(slotIndex);
            });
            this.widgets.forEach((item)=>{
                data.input[item.name] = item.value;
            });
            var response = await fetch("http://localhost:6165/api", {
                method: "POST", // Setting the method to POST
                headers: {
                    "Content-Type": "application/json", // Specifying the content type
                },
                body: JSON.stringify(data), // Converting the JavaScript object to a JSON string
            });
            var result = await response.json();
            console.log(result.result);
            if (result.result) {
                Object.entries(result.result).forEach(([slot, data]) => {
                    this.setOutputData(Number(slot)+1, data); // +1 because the first slot is for the next EVENT
                });
            }
            this.triggerSlot(0); // Trigger the next node
        }
    };
    nodeClass.title = nodeData.title || "Unnamed";
    nodeClass.desc = nodeData.desc || "No description";

    LiteGraph.registerNodeType(nodeData.type, nodeClass);
}

async function initServersideNodes() {
    const response = await fetch("http://localhost:6165/nodes");
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
initServersideNodes().then(() => {
    editor.restoreGraph();
});