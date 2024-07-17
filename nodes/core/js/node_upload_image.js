import { LiteGraph } from "/litegraph/src/litegraph.js";

// == Node: Upload Image ==
export class NodeUploadImage {

    static title = "Upload Image";
    static desc = "Upload an image from local file system";
    static min_height = 200;

    constructor() {
        var that = this;
        this.image = null; // Store the selected image
        this.image_url = null; // Store the URL of the uploaded image
        this.shape = "card";

        this.addWidget("button", "Upload Image", null, function() {
            that.uploadImage();
        }, {});
        this.addOutput("image", "image");

        this.widget_height = 60;
    }

    uploadImage() {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        var that=this;
        input.onchange = (event) => {
            that.onChange(that);
            var file = event.target.files[0];
            if (file) {
                var reader = new FileReader();
                reader.onload = (e) => {
                    this.image = e.target.result;
                    this.trigger("Image", this.image);
                    this.setDirtyCanvas(true);
                    this.postImage(file);
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }

    postImage(file) {
        const formData = new FormData();
        formData.append('id', this.id);
        formData.append('file', file);

        fetch(`${server_url}/upload`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            this.filename = data.filename;
            this.img = new Image();
            this.img.src = `${server_url}/input/${data.filename}`;
            this.img.crossOrigin = "anonymous";
            this.img.onload = () => {
                this.setDirtyCanvas(true);
            }
            console.log(`msg:  ${data.id}__${data.pointer}`);
            this.setOutputData("image", `${data.id}__${data.pointer}`);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    onDrawForeground(ctx) {
        if (this.img) {
            const maxWidth = this.size[0];
            const maxHeight = this.size[1] - this.widget_height;
            const ratio = Math.min(maxWidth / this.img.width, maxHeight / this.img.height);
            const width = this.img.width * ratio;
            const height = this.img.height * ratio;

            const x = (maxWidth - width) / 2;
            const y = this.widget_height + (maxHeight - height) / 2;

            ctx.drawImage(this.img, x, y, width, height);
            this.setDirtyCanvas(true);
        }
    }
}

LiteGraph.registerNodeType("core/UploadImage", NodeUploadImage);
