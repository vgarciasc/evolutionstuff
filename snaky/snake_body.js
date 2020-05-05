class SnakeBody extends GridAgent {
    constructor(pos, parentElem) {
        super(pos);

        this.defineFields(parentElem);
        this.tags = ["SnakeBody"];
    }

    defineFields(parentElem) {
        this.parentElem = parentElem;
        this.lastPosition = null;
    }
    
    render(tile_size) {
        strokeWeight(0);
        fill(255);
        rect(0, 0, tile_size, tile_size);
    }

    iterate(game) {
        if (this.parentElem) {
            this.lastPosition = this.pos.copy();
            this.setPos(game, this.parentElem.lastPosition);
        }
    }
}