class Food extends GridElement {
    constructor(tile, size) {
        super(tile, size);

        this.padding = this.size / 4;
    }

    show() {
        stroke(0);
        fill(20, 180, 20); //green
        rect(this.tile.i * this.size + this.padding,
            this.tile.j * this.size + this.padding,
            this.size - 2*this.padding,
            this.size - 2*this.padding);
    }
}