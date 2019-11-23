var bird;
var pipes = [];

var level_speed = 3;

function setup() {
    createCanvas(400, 300);
    frameRate(40);

    bird = new Bird();
    pipes.push(new Pipe());
}

function draw() {
    background(0);

    pipes = pipes.filter((f) => !f.offscreen());
    pipes.forEach((f) => {
        f.show();
        f.update(level_speed);
        if (f.hits(bird)) {
            console.log("hit");
        }
    });

    bird.show();
    bird.update();

    if (frameCount % 100 == 0) {
        pipes.push(new Pipe());
    }
}

function keyPressed() {
    if (key == ' ') {
        bird.up();
    }
}