import { LiteGraph } from "/litegraph/src/litegraph.js";

// == Node: Upload Image ==
export class NodeUploadImage {

    static title = "Upload Image";
    static desc = "Upload an image from local file system";

    constructor() {
        var that = this;
        this.image = null; // Store the selected image
        this.image_url = null; // Store the URL of the uploaded image

        this.addWidget("button", "Upload Image", null, function() {
            that.uploadImage();
        }, {});
        this.addOutput("Image", "image");
    }

    uploadImage() {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (event) => {
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
        formData.append('file', file);

        fetch('http://localhost:6165/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            this.filename = data.filename;
            this.img = new Image();
            this.img.src = `http://localhost:6165/input/${data.filename}`;
            this.setDirtyCanvas(true);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    onDrawForeground(ctx) {
        if (this.img) {
            ctx.drawImage(this.img, 0, this.size[1] + 10, 200, 200);
            this.setDirtyCanvas(true);
        }
    }

    onExecute() {
        if (this.image) {
            this.setOutputData(0, this.image);
        }
    }
}

LiteGraph.registerNodeType("core/UploadImage", NodeUploadImage);
