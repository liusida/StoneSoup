import { LiteGraph } from "/litegraph/src/litegraph.js";
import { LGraphCanvas } from "/litegraph/src/lgraphcanvas.js";
import { LGraph } from "/litegraph/src/lgraph.js";
import { initServersideNodes } from "/system/default/js/serverside_nodes.js";

export class StoneSoupEditor {
    constructor(container_id) {
        const root = (this.root = document.createElement("div"));
        root.className = "litegraph litegraph-editor";
        root.innerHTML = `
        <div class="content">
            <div class="editor-area">
                <canvas class="graphcanvas" width="1000" height="500" tabindex="10"></canvas>
            </div>
        </div>
        `;

        this.content = root.querySelector(".content");

        const canvas = (this.canvas = root.querySelector(".graphcanvas"));
        const graph = (this.graph = new LGraph());
        const graphcanvas = (this.graphcanvas = new LGraphCanvas(
            canvas,
            graph
        ));

        var that = this;
        
        graphcanvas.show_info = false;
        // Show connection arrows 
        graphcanvas.render_connection_arrows = true;


        graphcanvas.background_image =
            "/plugins/ss_editor/assets/ss_bg_dark.png";
        graphcanvas._pattern = null; // hack: need to reset pattern after set background image

        graph.onAfterExecute = () => {
            graphcanvas.draw(true);
        };

        graphcanvas.onDropItem = this.onDropItem.bind(this);

        // append to DOM
        const parent = document.getElementById(container_id);
        if (parent) {
            parent?.appendChild(root);
        } else {
            throw new Error("Editor has no parentElement to bind to");
        }

        graphcanvas.resize();

        // == Auto Save ==
        window.onbeforeunload = function () {
            var data = JSON.stringify(graph.serialize());
            localStorage.setItem("litegraphg demo backup", data);
        };

        // == Fill the window ==
        window.addEventListener("resize", function () {
            editor.graphcanvas.resize();
            that.updateEditorHiPPICanvas();
        });

    }

    restoreGraph() {
        var data = localStorage.getItem("litegraphg demo backup");
        if (data) {
            var graph_data = JSON.parse(data);
            graph.configure(graph_data);
        }
    }
    
    updateEditorHiPPICanvas() {
        const ratio = window.devicePixelRatio;
        if (ratio == 1) {
            return;
        }
        const rect = editor.canvas.parentNode.getBoundingClientRect();
        const { width, height } = rect;
        editor.canvas.width = width * ratio;
        editor.canvas.height = height * ratio;
        editor.canvas.style.width = width + "px";
        editor.canvas.style.height = height + "px";
        editor.canvas.getContext("2d").scale(ratio, ratio);
        return editor.canvas;
    }

    onDropItem(e) {
        var that = this;
        for (var i = 0; i < e.dataTransfer.files.length; ++i) {
            var file = e.dataTransfer.files[i];
            var ext = LGraphCanvas.getFileExtension(file.name);
            var reader = new FileReader();
            if (ext == "json") {
                reader.onload = (event) => {
                    var data = JSON.parse(event.target.result);
                    that.graph.configure(data);
                };
                reader.readAsText(file);
            }
        }
    }
}

var editor = new StoneSoupEditor("main");
window.graphcanvas = editor.graphcanvas;
window.graph = editor.graph;
window.editor = editor;

initServersideNodes().then(() => {
    editor.restoreGraph();
});