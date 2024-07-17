from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from glob import glob
import os
import mimetypes
mimetypes.add_type("application/javascript", ".js")

app = FastAPI()

server_url = None # don't need a custom server_url

# Function to generate script and link tags for multiple directories
def generate_tags(base_dirs):
    script_tags = []
    link_tags = []
    for physical_dir in base_dirs:
        base_dir = physical_dir.split('/')[-1]
        js_files = glob(f"{physical_dir}/*/js/*.js", recursive=True)
        css_files = glob(f"{physical_dir}/*/css/*.css", recursive=True)
        print(js_files)
        for js_file in js_files:
            script_path = os.path.relpath(js_file, physical_dir)
            script_tags.append(f'<script type="module" src="/{base_dir}/{script_path}"></script>')
        
        for css_file in css_files:
            css_path = os.path.relpath(css_file, physical_dir)
            link_tags.append(f'<link rel="stylesheet" href="/{base_dir}/{css_path}">')
    
    return script_tags, link_tags

@app.get("/", response_class=HTMLResponse)
async def serve_index():
    with open("client/web/index.html") as f:
        content = f.read()
    
    script_tags, link_tags = generate_tags(["client/system", "client/plugins", "nodes"])
    script_tags_str = "\n".join(script_tags)
    link_tags_str = "\n".join(link_tags)
    
    # Inject the tags before closing </body> and </head> tags
    content = content.replace("</head>", f"{link_tags_str}\n</head>")
    if server_url:
        server_url_script = f"<script>window.server_url='{server_url}';</script>"
    else:
        # Use the hostname of the browser with port 6165
        server_url_script = "<script>window.server_url=window.location.protocol + '//' + window.location.hostname + ':6165';</script>"

    content = content.replace("</body>", f"{server_url_script}\n{script_tags_str}\n</body>")

    return HTMLResponse(content=content)

# Mount directories
app.mount("/nodes", StaticFiles(directory="nodes"), name="nodes")

app.mount("/system", StaticFiles(directory="client/system"), name="system")
app.mount("/plugins", StaticFiles(directory="client/plugins"), name="plugins")
app.mount("/assets", StaticFiles(directory="client/assets"), name="assets")

app.mount("/litegraph", StaticFiles(directory="client/lib/litegraph.js-daniel/src/"), name="litegraph")
app.mount("/litegraph_css", StaticFiles(directory="client/lib/litegraph.js-daniel/css/"), name="litegraph_css")
# app.mount("/litegraph", StaticFiles(directory="client/lib/litegraph.tsx/src/core/"), name="litegraph")
# app.mount("/litegraph_css", StaticFiles(directory="client/lib/litegraph.tsx/css/"), name="litegraph_css")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=6166, reload=True)
