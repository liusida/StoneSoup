const graph = new LGraph();
const canvas = new LGraphCanvas("#mycanvas", graph);

// Set another background (so it's easier to tell the difference from ComfyUI)
canvas.background_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqAQMAAAD/DVsYAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFISEhGRkZYSQ4lAAAABtJREFUeJxjZGBg/8FwkHEwUf8ZfnIwMAwmCgDfc07r5j1EkwAAAABJRU5ErkJggg==";

// Resize Canvas (adjust resolution)
function resizeCanvas() {
    const scale = Math.max(window.devicePixelRatio, 1);
    canvasEl = document.getElementById("mycanvas");
    canvasEl.height = canvasEl.width = "";
    const { width, height } = canvasEl.getBoundingClientRect();
    canvasEl.width = Math.round(width * scale);
    canvasEl.height = Math.round(height * scale);
    canvasEl.getContext("2d").scale(scale, scale);
    canvas?.draw(true, true);
}
window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', resizeCanvas);
resizeCanvas();

// Add an event listener to the button to execute the graph
document.getElementById("executeButton").addEventListener("click", function() {
    graph.runStep(1);  // Execute one step of the graph
});
document.getElementById("startButton").addEventListener("click", function() {
    graph.start();
});
document.getElementById("stopButton").addEventListener("click", function() {
    graph.stop();
});