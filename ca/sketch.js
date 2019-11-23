/// <reference path="./lib/p5.global-mode.d.ts" />

let elementaryAutomata;

function setup() {
    createCanvas(800, 600);

    let length = 50;
    let initialState = ("0".repeat(length / 2) + "1" + "0".repeat(length / 2)).split("");
    elementaryAutomata = new ElementaryCA(59, initialState);
}

function draw() {
    background(50);
    
    elementaryAutomata.show();
    if (frameCount % 2 == 0) {
        elementaryAutomata.step();
        
        if (elementaryAutomata.done) {
            elementaryAutomata = randomAutomata();
        }
    }
}

function randomAutomata() {
    let length = 50;

    let initialState = [];
    for (var i = 0; i < length; i++) {
        initialState.push(int(random(0, 2)).toString());
    }

    // let initialState = ("0".repeat(length / 2) + "1" + "0".repeat(length / 2)).split("");
    return new ElementaryCA(random(255), initialState);
}

