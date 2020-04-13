class MazeCellularAutomata extends Grid {
    setRules(wall_neighbors, nothing_neighbors) {
        this.wall_neighbors = wall_neighbors;
        this.nothing_neighbors = nothing_neighbors;
    }

    iterate() {
        let new_state = [];
        this.elements.forEach((f) => {
            let new_elem = f.copy();
            new_elem.iterate(this, this.wall_neighbors, this.nothing_neighbors);
            new_state.push(new_elem);
        })
        this.elements = new_state;
    }
}

const MazeCellType = Object.freeze({WALL: 1, NOTHING: 2});
class MazeCell extends GridElement {
    constructor(pos, type) {
        super(pos, [0, 0, 0]);
        this.setType(type);
    }

    setType(type) {
        this.type = type;
    }

    render(tile_w, tile_h) {
        switch (this.type) {
            case MazeCellType.WALL:    fill( 20,  10,  10); break;
            case MazeCellType.NOTHING: fill(120,  30,  20); break;
            default:                   fill(  0,   0,   0); break;
        }

        strokeWeight(0);
        rect(0, 0, tile_w, tile_h);
    }

    iterate(grid, wall_neighbors, nothing_neighbors) {
        let neighbors = grid.getNeighbors(this);
        let neighbor_walls = neighbors.filter((f) => f.type == MazeCellType.WALL);

        if ((this.type == MazeCellType.WALL    && neighbor_walls.length >= wall_neighbors) || 
            (this.type == MazeCellType.NOTHING && neighbor_walls.length >= nothing_neighbors)) {
            this.setType(MazeCellType.WALL);
        } else {
            this.setType(MazeCellType.NOTHING);
        }
    }

    copy() {
        let cell = new MazeCell(this.pos.copy());
        cell.setType(this.type);
        return cell;
    }
}