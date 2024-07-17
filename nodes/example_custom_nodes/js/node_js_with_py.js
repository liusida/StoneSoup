// == Node: Example_JS_Py ==
export class NodeExample_JS_Py {

    static title = "Example_JS_Py";
    static desc = "Example_JS_Py";

    constructor() {
        var that=this;
        this.addInput("onTrigger", LiteGraph.EVENT);
        this.addWidget("string", "name", "Tom", this.onWidgetChanged);
        this.addOutput("onTrigger", LiteGraph.EVENT);
    }
    async onAction() {
        var name = this.widgets[0].value;
        const response = await fetch(`${server_url}/example?name=${encodeURIComponent(name)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });


        const data = await response.json();
        ui.showMessageBox(`<h1>Message from the server</h1><p>${data.string}</p>`);
        this.triggerSlot(0);
    }
}
LiteGraph.registerNodeType("example_custom_nodes/Example_JS_Py", NodeExample_JS_Py);
