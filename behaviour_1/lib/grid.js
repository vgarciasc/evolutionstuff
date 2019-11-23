const DIRECTION = Object.freeze({ UP: 0, DOWN: 1, LEFT: 2, RIGHT: 3 });

class Grid {
    constructor(w, h) {
        this.w = w;
        this.h = h;
        this.tileSize = width / this.w;
        
        this.objs = [];
    }

    show() {
        fill(0);
        strokeWeight(this.tileSize / 40);
        stroke(50);

        for (var j = 0; j < this.h; j++) {
            for (var i = 0; i < this.w; i++) {
                rect(i * this.tileSize, j * this.tileSize, this.tileSize, this.tileSize);
            }
        }

        this.objs.forEach((obj) => {
            obj.show();
        });
    }

    step() {
        this.objs.forEach((obj) => {
            obj.step();
        });
    }

    getNeighborhood(tile, d) {
        return this.objs.filter((obj) =>
            obj.tile.i >= tile.i-d && obj.tile.i <= tile.i+d &&
            obj.tile.j >= tile.j-d && obj.tile.j <= tile.j+d &&
            !(obj.tile.i == tile.i && obj.tile.j == tile.j));
    }

    elementAt(tile) {
        return this.objs.find((obj) => obj.tile.i == tile.i && obj.tile.j == tile.j);
    }

    removeAt(tile) {
        this.objs = this.objs.filter((obj) => !(obj.tile.i == tile.i && obj.tile.j == tile.j));
    }

    addObjects(objs) {
        this.objs = this.objs.concat(objs);
    }

    getRandomEmptyTile(start = 0, end = 0) {
        let tile;
        let counter = 0;

        do {
            tile = new Tile(
                round(random(start, this.w - 1 - end)),
                round(random(start, this.h - 1 - end))
            );

            counter++;
        } while (counter < 100 && this.elementAt(tile));

        return tile;
    }

    isTileValid(tile) {
        return tile.i >= 0 && tile.i < this.w && tile.j >= 0 && tile.j < this.h;
    }

    isTileEmpty(tile) {
        return !this.elementAt(tile);
    }

    isTileEmptyAndValid(tile) {
        return this.isTileEmpty(tile) && this.isTileValid(tile);
    }
}