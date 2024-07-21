function applyRunningNodeColor() {
    const origDrawNodeShape = LGraphCanvas.prototype.drawNodeShape;

    LGraphCanvas.prototype.drawNodeShape = function (node, ctx, size, fgcolor, bgcolor, selected, mouse_over) {
        const res = origDrawNodeShape.apply(this, arguments);
        if (node.running) {
            var color = "#0f0";

            // Set things up just like origDrawNodeShape
            var shape = node._shape || node.constructor.shape || LiteGraph.ROUND_SHAPE;
            var title_mode = node.constructor.title_mode;
            var title_height = LiteGraph.NODE_TITLE_HEIGHT;
            var render_title = true;
            if (title_mode == LiteGraph.TRANSPARENT_TITLE || title_mode == LiteGraph.NO_TITLE) {
              render_title = false;
            } else if (title_mode == LiteGraph.AUTOHIDE_TITLE && mouse_over) {
              render_title = true;
            }
            var area = new Float32Array(4);
            area[0] = 0; // x
            area[1] = render_title ? -title_height : 0; // y
            area[2] = size[0] + 1; // w
            area[3] = render_title ? size[1] + title_height : size[1]; // h
        
            // Copied from LGraphCanvas.js:
            if (node.onBounding) {
                node.onBounding(area);
              }
        
              if (title_mode == LiteGraph.TRANSPARENT_TITLE) {
                area[1] -= title_height;
                area[3] += title_height;
              }
              ctx.lineWidth = 1;
              ctx.globalAlpha = 0.8;
              ctx.beginPath();
              if (shape == LiteGraph.BOX_SHAPE) {
                ctx.rect(
                  -6 + area[0],
                  -6 + area[1],
                  12 + area[2],
                  12 + area[3],
                );
              } else if (
                shape == LiteGraph.ROUND_SHAPE ||
                            (shape == LiteGraph.CARD_SHAPE && node.flags.collapsed)
              ) {
                ctx.roundRect(
                  -6 + area[0],
                  -6 + area[1],
                  12 + area[2],
                  12 + area[3],
                  [this.round_radius * 2],
                );
              } else if (shape == LiteGraph.CARD_SHAPE) {
                ctx.roundRect(
                  -6 + area[0],
                  -6 + area[1],
                  12 + area[2],
                  12 + area[3],
                  [this.round_radius * 2, 2, this.round_radius * 2, 2],
                );
              } else if (shape == LiteGraph.CIRCLE_SHAPE) {
                ctx.arc(
                  size[0] * 0.5,
                  size[1] * 0.5,
                  size[0] * 0.5 + 6,
                  0,
                  Math.PI * 2,
                );
              }
              ctx.strokeStyle = color;
              ctx.stroke();
              ctx.strokeStyle = fgcolor;
              ctx.globalAlpha = 1;
        

        }
    }
}

applyRunningNodeColor();
