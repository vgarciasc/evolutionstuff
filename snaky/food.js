class Food extends GridAgent {
    defineTags() {
        return ["Food"];
    }

    render(tile_size) {
        strokeWeight(0);
        fill(0, 255, 0);
        rect(0, 0, tile_size, tile_size);
    }

    deepCopy() { return new Food(this.pos.copy()); }
}