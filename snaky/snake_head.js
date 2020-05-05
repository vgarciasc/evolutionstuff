class SnakeHead extends GridAgent {
    constructor(pos) {
        super(pos);

        this.defineFields();
        this.tags = ["SnakeHead"];
    }

    defineFields() {
        this.lastPosition = null;
    }
    
    render(tile_size) {
        strokeWeight(0);
        fill(210);
        rect(0, 0, tile_size, tile_size);
    }

    onCollide(game, collided) {
        if (collided.isTag("SnakeBody") || collided.isTag("Wall")) {
            game.die();
        } else if (collided.isTag("Food")) {
            game.consume(collided);
        }
    }

    iterate(game) {
        this.lastPosition = this.pos.copy();
        this.move(game, Directions.getVec(game.lastDirectionPressed));
    }
}