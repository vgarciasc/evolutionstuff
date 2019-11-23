/// <reference path="./lib/p5.global-mode.d.ts" />

const BOID_COUNT = 25;

let boids = []

function setup() {
    createCanvas(800, 600);
    frameRate(60);
    
    // for (var i = 0; i < 2; i++) {
    for (var i = 0; i < BOID_COUNT; i++) {
        var boid = new Boid(random(width), random(height));
        boid.velocity = createVector(random(-1, 1), random(-1, 1));
        boids.push(boid);
    }

    // boids[0].position = createVector(width/2 - 50, height/2);
    // boids[0].velocity = createVector(2, 1);
    // boids[1].position = createVector(width/2 + 50, height/2);
    // boids[1].velocity = createVector(-2, 1);
}

function draw() {
    background(0);

    handleMouse();

    boids.forEach((f) => {
        f.update();
        f.show();

        // f.separate(boids);
        // f.wander();
        // f.stayWithinBounds();
        // f.arrive(createVector(mouseX, mouseY));

        f.applyBehaviours(boids);
    });
}

function handleMouse() {
    stroke(0);
    fill(244, 122, 158);
    var size = 20;
    rect(mouseX - size/2, mouseY - size/2, size, size);
}