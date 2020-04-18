class GridElement {
    constructor(pos) {
        this.pos = pos;
        
        this.tags = this.defineTags();
        this.defineFields();
    }

    defineTags() { return []; }
    defineFields() { }
    
    isTag(tag) { return this.tags.find((f) => f == tag) != null }

    render(tile_size) { }
    iterate(grid) { }
    onCollide(grid, collided) { }

    move(grid, dir) {
        let new_pos = p5.Vector.add(this.pos, dir);
        let other_obj = grid.getAt(new_pos);
        if (other_obj) {
            this.onCollide(grid, other_obj);
        }

        if (grid.canMove(this, new_pos)) {
            this.pos.set(new_pos);
        }
    }

    moveTowards(grid, target_pos) {
        let diff = p5.Vector.sub(target_pos, this.pos);
        
        let next_vec = createVector(0, 0);
        if (Math.sign(diff.x) != 0) {
            next_vec = createVector(Math.sign(diff.x), 0);
        } else if (Math.sign(diff.y) != 0) {
            next_vec = createVector(0, Math.sign(diff.y));
        }

        this.move(grid, next_vec);
    }
}