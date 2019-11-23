class GridElement {
    constructor(tile, size) {
        this.tile = tile;
        this.size = size;
    }

    getName() { return this.constructor.name; }

    step() {}

    destroy() {
        GRID.removeAt(this.tile);
    }
}