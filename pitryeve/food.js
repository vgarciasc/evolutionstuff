class Food extends GridElement {
    defineTags() { return ["Food"]; }

    render(tile_size) {
        fill(30, 200, 30);
        strokeWeight(0);
        circle(tile_size/2, tile_size/2, tile_size*0.6);
    }
}