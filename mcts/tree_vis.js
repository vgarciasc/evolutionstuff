const vis = (s) => {
  let node_size = {"w": 60, "h": 100};
  let tree = null;

  let zoom = 1.00;
  let zMin = 0.05;
  let zMax = 9.00;
  let sensitivity = 0.05;
  let offset = {"x": 0, "y": 0};
  let dragging = false;
  let lastMouse = {"x": 0, "y": 0};

  s.setup = () => {
    s.textFont("Monospace");
    s.textStyle(s.NORMAL);
    s.createCanvas(600, 600);
  };

  s.draw = () => {
    s.push();
    s.translate(offset.x, offset.y);
    s.scale(zoom);
    s.background(255);

    if (s.tree != null) {
      let model = s.tree.model;
      let root = s.tree.root;

      // s.renderNode(model, root, 0, 0, 0, 0);
    }
    s.pop();
  };

  s.renderNode = (model, node, x, y, orgx, width) => {

    let translate_x = x * node_size.w * 1.2;
    let translate_y = y * node_size.h * 1.2;

    if (y < 3) {
      for (var i = 0; i < node.children.length; i++) {
        let child = node.children[i];
        let child_model = model.copy();
        child_model.makeMove(child.move);
        s.fill(255, 0, 0);
        let child_x = s.renderNode(
          child_model,
          child,
          x + 1,
          y + 1,
          orgx + i,
          1);
        x = child_x.x;
        width += child_x.width;
      }
    }

    s.push();
    s.translate(
      (x - (width)/2) * node_size.w * 1.2,
      y * node_size.h * 1.2);
    s.drawNode(model.grid, width, x);
    s.pop();

    return {"x": x, "width": width};
  }

  s.drawNode = (board, value, visits) => {
    let tile_size = node_size.w / 3;
    s.strokeWeight(1);
    s.fill(255);
    s.rect(0, 0, node_size.w, node_size.h);
    
    s.textSize(tile_size * 0.8);

    for (var j = 0; j < 3; j++) {
      for (var i = 0; i < 3; i++) {
        s.fill(255);
        s.stroke(0);
        s.rect(j * tile_size, i* tile_size, tile_size, tile_size);  
        s.fill(0);
        s.textAlign(s.CENTER, s.CENTER);
        s.text(board[i * 3 + j],
          j * tile_size + tile_size/2,
          i * tile_size + tile_size/2);
      }
    }
    
    s.textSize(tile_size * 0.5);

    s.textAlign(s.CENTER, s.TOP);
    s.translate(0, (node_size.h - node_size.w) / 10);
    s.text("va:" + value, node_size.w/2, node_size.w);
    s.text("vi:" + visits, node_size.w/2, node_size.w + (node_size.h - node_size.w) / 2);
  }

  s.mousePressed = () => {
    dragging = true;
    lastMouse.x = s.mouseX;
    lastMouse.y = s.mouseY;
  }

  s.mouseDragged = () => {
    if (dragging) {
      offset.x += (s.mouseX - lastMouse.x);
      offset.y += (s.mouseY - lastMouse.y);
      lastMouse.x = s.mouseX;
      lastMouse.y = s.mouseY;
    }
  }

  s.mouseReleased = () => {
    dragging = false;
  }

  s.mouseWheel = (event) => {
    zoom += sensitivity * event.delta;
    zoom = s.constrain(zoom, zMin, zMax);
    return false;
  }
};

let tree_vis_p5 = new p5(vis, "tree_vis");