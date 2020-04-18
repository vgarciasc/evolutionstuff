class RandomWalker extends GridElement {
    render(tile_size) {
        strokeWeight(0);
        fill(240, 20, 20);
        rect(0, 0, tile_size, tile_size);
    }

    iterate(grid) {
        let random_dir = Directions.randomDir();
        this.move(grid, random_dir);
    }
}