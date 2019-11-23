/// <reference path="./lib/p5.global-mode.d.ts" />

const STEP_DURATION = 30;
const AGENT_COUNT = 20;
const FOOD_COUNT = 5;

const GRID_W = 30;
const GRID_H = 30;
let GRID;

let generation = 0;
let counter = 1;

var speedSlider;
var speedSliderSpan;
var generationSpan;
var highscoreSpan;
var highscore = 0;

function setup() {
    let canvas = createCanvas(500, 500);
    canvas.parent('canvascontainer');
    frameRate(30);

    speedSlider = select("#speedSlider");
    speedSliderSpan = select("#speedSliderSpan");
    generationSpan = select("#generationSpan");
    highscoreSpan = select("#highscoreSpan");

    nextGeneration();
}

function draw() {
    background(0);
    
    GRID.show();
    
    let cycles = speedSlider.value();
    speedSliderSpan.html(cycles);

    for (var i = 0; i < cycles; i++) {
        if (counter % 50 == 0) {
            handleHighscore();
            nextGeneration();
            generation++;
            generationSpan.html(generation);
        }
        
        GRID.step();

        counter++;
    }
}

function handleHighscore() {
    GRID.objs.forEach((f) => {
        if (f.getName() == "Agent" && f.score > highscore) {
            highscore = f.score;
            highscoreSpan.html(highscore);
        }
    });
}