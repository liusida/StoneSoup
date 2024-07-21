// adopted from https://github.com/pythongosssss/ComfyUI-Custom-Scripts/

let fileInput;

class WorkflowImage {
    static accept = "";

    getBounds() {
        // Calculate the min max bounds for the nodes on the graph
        const bounds = graph._nodes.reduce(
            (p, n) => {
                if (n.pos[0] < p[0]) p[0] = n.pos[0];
                if (n.pos[1] < p[1]) p[1] = n.pos[1];
                const bounds = n.getBounding();
                const r = n.pos[0] + bounds[2];
                const b = n.pos[1] + bounds[3];
                if (r > p[2]) p[2] = r;
                if (b > p[3]) p[3] = b;
                return p;
            },
            [99999, 99999, -99999, -99999]
        );

        bounds[0] -= 100;
        bounds[1] -= 100;
        bounds[2] += 100;
        bounds[3] += 100;
        return bounds;
    }

    saveState() {
        editor.updateEditorHiPPICanvas();
        
        this.state = {
            scale: graphcanvas.ds.scale,
            width: graphcanvas.canvas.width,
            height: graphcanvas.canvas.height,
            bgwidth: graphcanvas.bgcanvas.width,
            bgheight: graphcanvas.bgcanvas.height,
            offset: graphcanvas.ds.offset,
            show_info: graphcanvas.show_info,
        };
    }

    restoreState() {
        graphcanvas.ds.scale = this.state.scale;
        graphcanvas.canvas.width = this.state.width;
        graphcanvas.canvas.height = this.state.height;
        graphcanvas.bgcanvas.width = this.state.bgwidth;
        graphcanvas.bgcanvas.height = this.state.bgheight;
        graphcanvas.ds.offset = this.state.offset;
        graphcanvas.show_info = this.state.show_info;
        editor.updateEditorHiPPICanvas();
    }

    updateView(bounds) {
        graphcanvas.ds.scale = 1;
        graphcanvas.canvas.width = bounds[2] - bounds[0];
        graphcanvas.canvas.height = bounds[3] - bounds[1];
        graphcanvas.bgcanvas.width = bounds[2] - bounds[0];
        graphcanvas.bgcanvas.height = bounds[3] - bounds[1];
        graphcanvas.ds.offset = [-bounds[0], -bounds[1]];
        graphcanvas.show_info = false;
    }

    async export(includeWorkflow) {
        // Save the current state of the canvas
        this.saveState();
        // Update to render the whole workflow
        this.updateView(this.getBounds());

        // Flag that we are saving and render the canvas
        graphcanvas.draw(true, true);

        // Generate a blob of the image containing the workflow
        const blob = await this.getBlob(
            includeWorkflow ? JSON.stringify(graph.serialize()) : undefined
        );

        // Restore initial state and redraw
        this.restoreState();
        graphcanvas.draw(true, true);

        // Download the generated image
        this.download(blob);
    }

    download(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        Object.assign(a, {
            href: url,
            download: "workflow." + this.extension,
            style: "display: none",
        });
        document.body.append(a);
        a.click();
        setTimeout(function () {
            a.remove();
            window.URL.revokeObjectURL(url);
        }, 0);
    }

    // This function getPngMetadata() is learned from https://github.com/comfyanonymous/ComfyUI/blob/master/web/scripts/pnginfo.js
    static getPngMetadata(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const pngData = new Uint8Array(event.target.result);
                    const dataView = new DataView(pngData.buffer);

                    // Check that the PNG signature is present
                    if (dataView.getUint32(0) !== 0x89504e47) {
                        throw new Error("Not a valid PNG file");
                    }

                    let offset = 8;
                    const metadata = {};

                    // Loop through the chunks in the PNG file
                    while (offset < pngData.length) {
                        const length = dataView.getUint32(offset);
                        const type = String.fromCharCode(
                            ...pngData.slice(offset + 4, offset + 8)
                        );

                        if (["tEXt", "comf", "iTXt"].includes(type)) {
                            const keywordEnd = pngData.indexOf(0, offset + 8);
                            const keyword = String.fromCharCode(
                                ...pngData.slice(offset + 8, keywordEnd)
                            );
                            const contentArraySegment = pngData.slice(
                                keywordEnd + 1,
                                offset + 8 + length
                            );
                            const content = new TextDecoder("utf-8").decode(
                                contentArraySegment
                            );
                            metadata[keyword] = content;
                        }

                        offset += 12 + length;
                    }

                    resolve(metadata);
                } catch (error) {
                    console.error(error);
                    reject(error);
                }
            };

            reader.onerror = (error) => {
                console.error("File reading error:", error);
                reject(error);
            };

            reader.readAsArrayBuffer(file);
        });
    }

    static import() {
        if (!fileInput) {
            fileInput = document.createElement("input");
            Object.assign(fileInput, {
                type: "file",
                style: "display: none",
                onchange: () => {
                    // TODO: read graph data from fileInput.files[0]
                    // use `graph.configure(graph_data);` to load the graph data to editor
                    WorkflowImage.getPngMetadata(fileInput.files[0]).then(
                        (metadata) => {
                            var graph_data = JSON.parse(metadata.workflow);
                            graph.configure(graph_data);
                        }
                    );
                },
            });
            document.body.append(fileInput);
        }
        fileInput.accept = WorkflowImage.accept;
        fileInput.click();
    }
}

class PngWorkflowImage extends WorkflowImage {
    static accept = ".png,image/png";
    extension = "png";

    n2b(n) {
        return new Uint8Array([
            (n >> 24) & 0xff,
            (n >> 16) & 0xff,
            (n >> 8) & 0xff,
            n & 0xff,
        ]);
    }

    joinArrayBuffer(...bufs) {
        const result = new Uint8Array(
            bufs.reduce((totalSize, buf) => totalSize + buf.byteLength, 0)
        );
        bufs.reduce((offset, buf) => {
            result.set(buf, offset);
            return offset + buf.byteLength;
        }, 0);
        return result;
    }

    crc32(data) {
        const crcTable =
            PngWorkflowImage.crcTable ||
            (PngWorkflowImage.crcTable = (() => {
                let c;
                const crcTable = [];
                for (let n = 0; n < 256; n++) {
                    c = n;
                    for (let k = 0; k < 8; k++) {
                        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
                    }
                    crcTable[n] = c;
                }
                return crcTable;
            })());
        let crc = 0 ^ -1;
        for (let i = 0; i < data.byteLength; i++) {
            crc = (crc >>> 8) ^ crcTable[(crc ^ data[i]) & 0xff];
        }
        return (crc ^ -1) >>> 0;
    }

    async getBlob(workflow) {
        return new Promise((r) => {
            graphcanvas.canvas.toBlob(async (blob) => {
                if (workflow) {
                    // If we have a workflow embed it in the PNG
                    const buffer = await blob.arrayBuffer();
                    const typedArr = new Uint8Array(buffer);
                    const view = new DataView(buffer);

                    const data = new TextEncoder().encode(
                        `tEXtworkflow\0${workflow}`
                    );
                    const chunk = this.joinArrayBuffer(
                        this.n2b(data.byteLength - 4),
                        data,
                        this.n2b(this.crc32(data))
                    );

                    const sz = view.getUint32(8) + 20;
                    const result = this.joinArrayBuffer(
                        typedArr.subarray(0, sz),
                        chunk,
                        typedArr.subarray(sz)
                    );

                    blob = new Blob([result], { type: "image/png" });
                }

                r(blob);
            });
        });
    }
}

class DataReader {
    /**	@type {DataView} */
    view;
    /** @type {boolean | undefined} */
    littleEndian;
    offset = 0;

    /**
     * @param {DataView} view
     */
    constructor(view) {
        this.view = view;
    }

    /**
     * Reads N bytes and increments the offset
     * @param {1 | 2 | 4 | 8} size
     */
    read(size, signed = false, littleEndian = undefined) {
        const v = this.peek(size, signed, littleEndian);
        this.offset += size;
        return v;
    }

    /**
     * Reads N bytes
     * @param {1 | 2 | 4 | 8} size
     */
    peek(size, signed = false, littleEndian = undefined) {
        this.view.getBigInt64;
        let m = "";
        if (size === 8) m += "Big";
        m += signed ? "Int" : "Uint";
        m += size * 8;
        m = "get" + m;
        if (!this.view[m]) {
            throw new Error("Method not found: " + m);
        }

        return this.view[m](
            this.offset,
            littleEndian == null ? this.littleEndian : littleEndian
        );
    }

    /**
     * Seeks to the specified position or by the number of bytes specified relative to the current offset
     * @param {number} pos
     * @param {boolean} relative
     */
    seek(pos, relative = true) {
        if (relative) {
            this.offset += pos;
        } else {
            this.offset = pos;
        }
    }
}

class WorkflowImagePlugin {
    static name = "pysssss.WorkflowImage";
    init() {
        // https://codepen.io/peterhry/pen/nbMaYg
        function wrapText(context, text, x, y, maxWidth, lineHeight) {
            var words = text.split(" "),
                line = "",
                i,
                test,
                metrics;

            for (i = 0; i < words.length; i++) {
                test = words[i];
                metrics = context.measureText(test);
                while (metrics.width > maxWidth) {
                    // Determine how much of the word will fit
                    test = test.substring(0, test.length - 1);
                    metrics = context.measureText(test);
                }
                if (words[i] != test) {
                    words.splice(i + 1, 0, words[i].substr(test.length));
                    words[i] = test;
                }

                test = line + words[i] + " ";
                metrics = context.measureText(test);

                if (metrics.width > maxWidth && i > 0) {
                    context.fillText(line, x, y);
                    line = words[i] + " ";
                    y += lineHeight;
                } else {
                    line = test;
                }
            }

            context.fillText(line, x, y);
        }
    }

    setup() {
        const formats = [PngWorkflowImage];
        for (const f of formats) {
            f.init?.call();
            WorkflowImage.accept +=
                (WorkflowImage.accept ? "," : "") + f.accept;
        }

        // Add canvas menu options
        const orig = LGraphCanvas.prototype.getCanvasMenuOptions;
        LGraphCanvas.prototype.getCanvasMenuOptions = function () {
            const options = orig.apply(this, arguments);

            options.push(null, {
                content: "Workflow Image",
                submenu: {
                    options: [
                        {
                            content: "Import",
                            callback: () => {
                                WorkflowImage.import();
                            },
                        },
                        {
                            content: "Export",
                            submenu: {
                                options: formats.flatMap((f) => [
                                    {
                                        content: f.name
                                            .replace("WorkflowImage", "")
                                            .toLocaleLowerCase(),
                                        callback: () => {
                                            new f().export(true);
                                        },
                                    },
                                    {
                                        content:
                                            f.name
                                                .replace("WorkflowImage", "")
                                                .toLocaleLowerCase() +
                                            " (no embedded workflow)",
                                        callback: () => {
                                            new f().export();
                                        },
                                    },
                                ]),
                            },
                        },
                    ],
                },
            });
            return options;
        };
    }
}

var workflowImage = new WorkflowImagePlugin();
workflowImage.init();
workflowImage.setup();
