class VyAgent extends GridElement {
    render(tile_size) {
        strokeWeight(0);
        fill(200, 20, 20);
        rect(0, 0, tile_size, tile_size);
    }

    iterate(grid) {
        let nearest_food = grid.elements.find((f) => f.tags.indexOf("Food") != -1);
        if (nearest_food) {
            this.moveTowards(grid, nearest_food.pos);
        } else {
            let random_dir = Directions.randomDir();
            this.move(grid, random_dir);
        }
    }

    onCollide(grid, collided) { 
        if (collided.isTag("Food")) {
            grid.removeElement(collided);
        }
    }
}