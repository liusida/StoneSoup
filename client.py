from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from glob import glob
import os
import mimetypes
mimetypes.add_type("application/javascript", ".js")

app = FastAPI()

server_url = "http://localhost:6165"

# Function to generate script and link tags for multiple directories
def generate_tags(base_dirs):
    script_tags = []
    link_tags = []
    for base_dir in base_dirs:
        js_files = glob(f"{base_dir}/*/js/*.js", recursive=True)
        css_files = glob(f"{base_dir}/*/css/*.css", recursive=True)
        print(js_files)
        for js_file in js_files:
            script_path = os.path.relpath(js_file, base_dir)
            script_tags.append(f'<script type="module" src="/{base_dir}/{script_path}"></script>')
        
        for css_file in css_files:
            css_path = os.path.relpath(css_file, base_dir)
            link_tags.append(f'<link rel="stylesheet" href="/{base_dir}/{css_path}">')
    
    return script_tags, link_tags

@app.get("/", response_class=HTMLResponse)
async def serve_index():
    with open("web/index.html") as f:
        content = f.read()
    
    script_tags, link_tags = generate_tags(["system", "plugins", "nodes"])
    script_tags_str = "\n".join(script_tags)
    link_tags_str = "\n".join(link_tags)
    
    # Inject the tags before closing </body> and </head> tags
    content = content.replace("</head>", f"{link_tags_str}\n</head>")
    content = content.replace("</body>", f"<script>window.server_url='{server_url}';</script>\n{script_tags_str}\n</body>")

    return HTMLResponse(content=content)

# Mount directories
app.mount("/system", StaticFiles(directory="system"), name="system")
app.mount("/plugins", StaticFiles(directory="plugins"), name="plugins")
app.mount("/nodes", StaticFiles(directory="nodes"), name="nodes")
app.mount("/assets", StaticFiles(directory="assets"), name="assets")
app.mount("/litegraph", StaticFiles(directory="lib/litegraph.js-daniel"), name="litegraph_tsx")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("client:app", host="0.0.0.0", port=6166, reload=True)
