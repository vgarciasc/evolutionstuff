let grid = null;

function setup() {
    let tiles_x = 50;
    let tiles_y = 50;
    let canvas_w = 500;
    let canvas_h = 500;
    let tile_w = canvas_w / tiles_x;
    let tile_h = canvas_h / tiles_y;

    let canvas = createCanvas(canvas_w, canvas_h);
    canvas.parent('canvascontainer');

    let wall_neighbors_rule = parseInt(select("#wall_neighbors_input").value());
    let nothing_neighbors_rule = parseInt(select("#nothing_neighbors_input").value());

    grid = new MazeCellularAutomata(tiles_x, tiles_y, tile_w, tile_h, [], []);

    grid.setRules(wall_neighbors_rule, nothing_neighbors_rule);

    for (var i = 0; i < tiles_y; i++) {
        for (var j = 0; j < tiles_x; j++) {
            let dice = random();
            let elem = null;
            
            if (dice < 0.45) {
                elem = new MazeCell(createVector(i, j), MazeCellType.WALL);
            } else {
                elem = new MazeCell(createVector(i, j), MazeCellType.NOTHING);
            }

            grid.addElement(elem);
        }
    }
}

function draw() {
    grid.render();
}