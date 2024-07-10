import { LGraphCanvas } from "./litegraph.js-daniel/src/lgraphcanvas.js";
import { LGraph } from "./litegraph.js-daniel/src/lgraph.js";

// Creates an interface to access extra features from a graph (like play, stop, live, etc)
export class StoneSoupEditor {

    constructor(container_id) {

        const root = this.root = document.createElement("div");
        root.className = "litegraph litegraph-editor";
        root.innerHTML = `
        <div class="header">
            <div class="tools tools-left"></div>
            <div class="tools tools-right"></div>
        </div>
        <div class="content">
            <div class="editor-area">
                <canvas class="graphcanvas" width="1000" height="500" tabindex="10"></canvas>
            </div>
        </div>
        `;

        this.tools = root.querySelector(".tools");
        this.content = root.querySelector(".content");

        const canvas = this.canvas = root.querySelector(".graphcanvas");
        const graph = this.graph = new LGraph();
        const graphcanvas = this.graphcanvas = new LGraphCanvas(canvas, graph);
        
        graphcanvas.show_info = false;
        
        graphcanvas.background_image = "imgs/ss-bg-dark.png";
        graphcanvas._pattern = null; // hack: need to reset pattern after set background image

        graph.onAfterExecute = () => {
            graphcanvas.draw(true);
        };

        graphcanvas.onDropItem = this.onDropItem.bind(this);

        this.addToolsButton(
            "playnode_button",
            "Play",
            "litegraph.js-daniel/editor/imgs/icon-play.png",
            this.onPlayButton.bind(this),
            ".tools-right",
        );
        this.addToolsButton(
            "playstepnode_button",
            "Step",
            "litegraph.js-daniel/editor/imgs/icon-playstep.png",
            this.onPlayStepButton.bind(this),
            ".tools-right",
        );

        // append to DOM
        const parent = document.getElementById(container_id);
        if (parent) {
            parent?.appendChild(root);
        } else {
            throw new Error("Editor has no parentElement to bind to");
        }

        graph.onPlayEvent = () => {
            const button = this.root.querySelector("#playnode_button");
            button.innerHTML = `<img src="litegraph.js-daniel/editor/imgs/icon-stop.png"/> Stop`;
        };

        graph.onStopEvent = () => {
            const button = this.root.querySelector("#playnode_button");
            button.innerHTML = `<img src="litegraph.js-daniel/editor/imgs/icon-play.png"/> Play`;
        };

        graphcanvas.resize();
    }

    addToolsButton(id, name, icon_url, callback, container = ".tools") {
        const button = this.createButton(name, icon_url, callback);
        button.id = id;
        this.root.querySelector(container).appendChild(button);
    }

    createButton(name, icon_url, callback) {
        const button = document.createElement("button");
        if (icon_url) {
            button.innerHTML = `<img src="${icon_url}"/> `;
        }
        button.classList.add("btn");
        button.innerHTML += name;
        if(callback)
            button.addEventListener("click", callback );
        return button;
    }

    onPlayButton() {
        var graph = this.graph;
        if (graph.status == LGraph.STATUS_STOPPED) {
            graph.start();
        } else {
            graph.stop();
        }
    }

    onPlayStepButton() {
        var graph = this.graph;
        graph.runStep(1);
        this.graphcanvas.draw(true, true);
    }

    onDropItem(e) {
        var that = this;
        for(var i = 0; i < e.dataTransfer.files.length; ++i) {
            var file = e.dataTransfer.files[i];
            var ext = LGraphCanvas.getFileExtension(file.name);
            var reader = new FileReader();
            if(ext == "json") {
                reader.onload = (event) => {
                    var data = JSON.parse( event.target.result );
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
window.addEventListener("resize", function() { 
    editor.graphcanvas.resize();
    updateEditorHiPPICanvas();
});
window.onbeforeunload = function(){
    var data = JSON.stringify( graph.serialize() );
    localStorage.setItem("litegraphg demo backup", data );
}

var data = localStorage.getItem("litegraphg demo backup");
if(data) {
    var graph_data = JSON.parse(data);
    graph.configure( graph_data );
}
