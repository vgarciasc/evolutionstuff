class Wall extends GridAgent {
    render(tile_size) { 
        strokeWeight(0);
        fill(20, 20, 20);
        rect(0, 0, tile_size, tile_size);
    }
}