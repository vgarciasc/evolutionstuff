class GridAgent {
    constructor(grid, pos) {
        this.grid = grid;
        this.pos = pos;
    }

    render(tile_size) { }

    move(dir) {
        let new_pos = p5.Vector.add(this.pos, dir);
        if (this.grid.canMove(this, new_pos)) {
            this.pos.set(new_pos);
        }
    }

    iterate() { }
}