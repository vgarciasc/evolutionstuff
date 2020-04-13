class GridElement {
    constructor(pos, color=[255, 0, 0]) {
        this.pos = pos;
        this.color = color;
    }

    render(tile_w, tile_h) {
        strokeWeight(0);
        fill(this.color);
        rect(0, 0, tile_w, tile_h);
    }

    iterate() { }

    copy() {
        return new GridElement(this.pos.copy(), this.color.slice(0));
    }
}