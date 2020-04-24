let tree_vis_p5 = new p5((s) => {
    let my_tree = null;
    let node_distance = {x: 0.1, y: 1};
    let node_size = {x: 90, y: 25};
    
    s.setup = () => {
        canvas = s.createCanvas(500, 300);
        
        s.textAlign(CENTER, CENTER);
        s.textSize(9);
    }
    
    s.draw = () => {
        s.background(240);
        
        s.push();
        s.translate(10, 10);
        
        if (my_tree) {
            s.postorderDraw(my_tree, my_tree.get(0));
        }
        
        s.pop();
    }
    
    s.updateTree = (tree) => {
        my_tree = prepareTree(tree);
    }
    
    s.postorderDraw = (tree, node) => {
        let children = tree.getChildren(node);
        
        for (var i = 0; i < children.length; i++) {
            let child = children[i];
            s.postorderDraw(tree, child);
        }
        
        s.push();
        s.translate(node.data.final_x * (1 + node_distance.x) * node_size.x,
                    node.data.y       * (1 + node_distance.y) * node_size.y);
        
        let label = node.data.val.name;
        s.rect(0, 0, node_size.x, node_size.y); 
        s.text(label, node_size.x / 2, node_size.y / 2);

        if (!node.isRoot()) {
            let dashlength = - node_distance.y/2 * node_size.y;
            s.line(node_size.x / 2, 0, node_size.x / 2, dashlength);
        }
        
        if (!node.isLeaf()) {
            s.line(node_size.x / 2, node_size.y, node_size.x / 2, (1 + node_distance.y/2) * node_size.y);
        }
        
        s.pop();
        
        //drawing edges
        if (children.length > 0 && !node.data.collapsed) {
            s.line(
                (children[0].data.final_x * (1 + node_distance.x) + 1/2) * node_size.x,
                (node.data.y) * (1 + node_distance.y) * node_size.y + node_size.y + node_distance.y/2 * node_size.y,
                (children[children.length - 1].data.final_x * (1 + node_distance.x) + 1/2) * node_size.x,
                (node.data.y) * (1 + node_distance.y) * node_size.y + node_size.y + node_distance.y/2 * node_size.y);
            }
        }
        
        // s.postorderDraw = (tree, node, node_size, render_func) => {
        //     let children = tree.getChildren(node);
        
        //     for (var i = 0; i < children.length; i++) {
        //         let child = children[i];
        //         s.postorderDraw(tree, child, node_size, render_func);
        //     }
        
        //     s.push();
        //     s.translate(node.data.final_x * 2 * node_size.x, node.data.y * 2 * node_size.y);
        
        //     render_func(node, node_size);
        
        //     //drawing edges
        //     if (node.id != 0) {
        //         s.line(node_size.x / 2, 0, node_size.x / 2, - node_size.y/2);
        //     }
        
        //     if (children.length > 0) {
        //         s.line(node_size.x / 2, node_size.y, node_size.x / 2, node_size.y * 1.5);
        //     }
        
        //     s.pop();
        
        //     //drawing edges
        //     if (children.length > 0) {
        //         s.line((children[0].data.final_x * 2 + 1/2) * node_size.x,
        //             (2 * node.data.y + 3/2) * node_size.y,
        //             (children[children.length - 1].data.final_x * 2+ 1/2) * node_size.x,
        //             (2 * node.data.y + 3/2) * node_size.y);
        //     }
        // }
    }, "tree_vis");