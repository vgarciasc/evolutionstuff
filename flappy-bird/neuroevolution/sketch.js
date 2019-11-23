const TOTAL_POPULATION = 50;
var birds = [];
var pipes = [];

var level_speed = 3;
var cycles = 1;
var counter = 0;

var highscore = 0;
var alltimeHighscore = 0;

var highscoreSpan;
var alltimeHighscorePan;
var saveButton;

function setup() {
    let canvas = createCanvas(400, 300);
    canvas.parent('canvascontainer');
    tf.setBackend('cpu');
    // frameRate(30);

    highscoreSpan = select('#hs');
    alltimeHighscoreSpan = select('#ahs');
    saveButton = select('#savebtn');
    saveButton.mousePressed(saveBestModel);

    callNextGen();
}

function draw() {
    background(0);

    for (var i = 0; i < cycles; i++) {
        handlePipes();
        handleBirds();
        handleScore();
    
        counter += 1;
    }
}

function handlePipes() {
    if (counter % 100 == 0) {
        pipes.push(new Pipe());
    }

    pipes = pipes.filter((f) => !f.offscreen());
    pipes.forEach((f) => {
        f.show();
        f.update(level_speed);
        birds.forEach((g) => {
            if (f.hits(g)) {
                g.kill();
            }
        })
    });
}

function handleBirds() {
    var env = getEnvironment();
    var activeBirds = birds.filter((f) => f.active);

    activeBirds.forEach((f) => {
        f.think(env);
        f.show();
        f.update();
    });
    
    if (activeBirds.length === 0) {
        callNextGen();
    }
}

function handleScore() {
    var highscorer = birds.reduce((a, b) => a.score > b.score ? a : b);
    highscore = highscorer.score > highscore ? highscorer.score : highscore;
    alltimeHighscore = highscore > alltimeHighscore ? highscore : alltimeHighscore;
    highscoreSpan.html(highscore);
    alltimeHighscoreSpan.html(alltimeHighscore);
}

function callNextGen() {
    highscore = 0;
    pipes = [new Pipe()];
    nextGeneration();
}

function getEnvironment() {
    return {pipes: pipes};
}

function saveBestModel() {
    var highscorer = birds.reduce((a, b) => a.score > b.score ? a : b);
    highscorer.brain.saveModel();
}