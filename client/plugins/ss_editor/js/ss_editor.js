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

        graphcanvas.show_info = true;
        graphcanvas.renderInfo = this.renderInfo;

        graphcanvas.render_canvas_border = false;

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

        // == Auto Save ==
        window.onbeforeunload = function () {
            var data = JSON.stringify(graph.serialize());
            localStorage.setItem("litegraphg demo backup", data);
        };

        // == Fill the window ==
        graphcanvas.autoresize = false;
        graphcanvas.resize();
        this.updateEditorHiPPICanvas();
        window.addEventListener("resize", function () {
            that.graphcanvas.resize();
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
        // updating the High-Performance Pixel Image (HiPPI) canvas
        const ratio = window.devicePixelRatio;
        // this is the ratio of the screen (Windows Settings) 125% = 1.25
        if (ratio == 1) {
            return;
        }
        const rect = this.canvas.parentNode.getBoundingClientRect();
        const { width, height } = rect;
        this.canvas.width = width * ratio;
        this.canvas.height = height * ratio;
        this.canvas.style.width = width + "px";
        this.canvas.style.height = height + "px";
        this.canvas.getContext("2d").scale(ratio, ratio);
        // return editor.canvas;
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

    renderInfo(ctx, x, y) {
        x = x || 10;
        y = y || this.canvas.height / window.devicePixelRatio  - 80;

        ctx.save();
        ctx.translate(x, y);

        ctx.font = "10px Arial";
        ctx.fillStyle = "#888";
        ctx.textAlign = "left";
        const line_height = 13;
        if (this.graph) {
            ctx.fillText(
                "Canvas: " + (this.ds.visible_area[2]).toFixed(0) + " x " + (this.ds.visible_area[3]).toFixed(0),
                5,
                line_height * 1
            );
            ctx.fillText(
                "HTML: " + this.canvas.width + " x " + this.canvas.height,
                5,
                line_height * 2
            );
            ctx.fillText(
                "Time: " + this.graph.globaltime.toFixed(2) + "s",
                5,
                line_height * 3
            );
            ctx.fillText(
                "Node: " +
                    this.graph._nodes.length +
                    " [" +
                    this.visible_nodes.length +
                    "]",
                5,
                line_height * 4
            );
            ctx.fillText("FPS:" + this.fps.toFixed(2), 5, line_height * 5);
        } else {
            ctx.fillText("No graph selected", 5, line_height * 1);
        }
        ctx.restore();
    }
}

var editor = new StoneSoupEditor("main");
window.graphcanvas = editor.graphcanvas;
window.graph = editor.graph;
window.editor = editor;

initServersideNodes().then(() => {
    editor.restoreGraph();
});
