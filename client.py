from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import os
import mimetypes
mimetypes.add_type("application/javascript", ".js")

app = FastAPI()

# Function to generate script and link tags for plugins
def generate_plugin_tags(plugins_dir):
    script_tags = []
    link_tags = []
    for root, dirs, files in os.walk(plugins_dir):
        for file in files:
            if file.endswith(".js"):
                script_path = os.path.relpath(os.path.join(root, file), plugins_dir)
                script_tags.append(f'<script type="module" src="/plugins/{script_path}"></script>')
            elif file.endswith(".css"):
                css_path = os.path.relpath(os.path.join(root, file), plugins_dir)
                link_tags.append(f'<link rel="stylesheet" href="/plugins/{css_path}">')
    return script_tags, link_tags

@app.get("/", response_class=HTMLResponse)
async def serve_index():
    with open("web/index.html") as f:
        content = f.read()
    
    script_tags, link_tags = generate_plugin_tags("plugins")
    script_tags_str = "\n".join(script_tags)
    link_tags_str = "\n".join(link_tags)

    # Inject the tags before closing </body> and </head> tags
    content = content.replace("</head>", f"{link_tags_str}\n</head>")
    content = content.replace("</body>", f"{script_tags_str}\n</body>")

    return HTMLResponse(content=content)

# Mount directories
app.mount("/plugins", StaticFiles(directory="plugins"), name="plugins")
app.mount("/assets", StaticFiles(directory="assets"), name="assets")
app.mount("/litegraph", StaticFiles(directory="lib/litegraph.js-daniel"), name="litegraph_tsx")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("client:app", host="0.0.0.0", port=6166, reload=True)
