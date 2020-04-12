let grid = null;

function setup() {
    let canvas = createCanvas(500, 500);
    canvas.parent('canvascontainer');

    grid = new Grid(10, 10, 50, [], [
        {classname: RandomWalker, collidable: [RandomWalker, Wall]}
    ]);

    grid.addElement(new RandomWalker(grid, createVector(5, 5)));
    for (var i = 0; i < 10; i++) {
        grid.addElement(new Wall(grid, createVector(i, 0)));
        grid.addElement(new Wall(grid, createVector(0, i)));
        grid.addElement(new Wall(grid, createVector(i, 9)));
        grid.addElement(new Wall(grid, createVector(9, i)));
    }

    setInterval(() => {
        grid.iterate();
    }, 500);
}

function draw() {
    grid.render();
}