export class NodePreviewImage {
    static title = "Preview Image";
    static desc = "Preview an image";
    static min_height = 200;
    static updateFrequency = 5;

    constructor() {
        var that = this;
        this.image = null; // Store the selected image
        this.image_url = null; // Store the URL of the uploaded image
        this.shape = "card";
        this.addInput("onTrigger", LiteGraph.EVENT);
        this.addOutput("onTrigger", LiteGraph.EVENT);
        this.addInput("image", "image");

        this.widget_height = 60;
        this.chunks = [];
    }

    async onAction() {
        if (this.complete) {
            this.triggerSlot(0); // Trigger the next node
            return;
        }
        const image_pointer = this.getInputData(1);
        if (!image_pointer) {
            ui.showMessageBox("no images to preview.");
            return;
        }
        if (!this.img) {
            this.img = new Image();
        }

        const response = await fetch(`${server_url}/preview?image_pointer=${encodeURIComponent(image_pointer)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });


        const data = await response.json();
        this.imageWidth = parseInt(data.headers["X-Image-Width"]);
        this.imageHeight = parseInt(data.headers["X-Image-Height"]);
        const imageUrl = new URL(data.url, server_url).href;

        // Fetch image as a stream
        const imageResponse = await fetch(imageUrl);
        const reader = imageResponse.body.getReader();
        this.chunks = [];
        const updateInterval = 1000; // Time interval in milliseconds

        const updateImage = () => {
            if (this.chunks.length > 0) {
                const blob = new Blob(this.chunks, { type: "image/png" });
                const tempImg = new Image();
                tempImg.onload = () => {
                    this.img.src = tempImg.src;
                    this.setDirtyCanvas(true);
                };
                tempImg.src = URL.createObjectURL(blob);
            }
        };
        const intervalId = setInterval(updateImage.bind(this), updateInterval);

        const process = async ({ done, value }) => {
            if (done) {
                clearInterval(intervalId); // Clear the interval when done
                updateImage.call(this); // Final update
                this.complete = true;
                this.triggerSlot(0); // Trigger the next node
                return;
            }
            this.chunks.push(value);
            reader.read().then(process);
        };

        reader.read().then(process);
    }

    onDrawForeground(ctx) {
        if (this.img && this.img.src) {
            const maxWidth = this.size[0];
            const maxHeight = this.size[1] - this.widget_height;
            const ratio = Math.min(
                maxWidth / this.imageWidth,
                maxHeight / this.imageHeight
            );
            var width = this.imageWidth * ratio;
            var height = this.imageHeight * ratio;

            const x = (maxWidth - width) / 2;
            const y = this.widget_height + (maxHeight - height) / 2;

            ctx.drawImage(this.img, x, y, width, height);
            // this.setDirtyCanvas(true);
        }
    }
}

LiteGraph.registerNodeType("core/Preview", NodePreviewImage);
