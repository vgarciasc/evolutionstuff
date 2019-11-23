/// <reference path="./p5.global-mode.d.ts" />

class ElementaryCA {
    constructor(ruleNumber, state) {
        this.rule = (ruleNumber >>> 0).toString(2).padStart(8, "0");
        
        this.state = state;
        this.stateHistory = [];
        this.length = state.length;

        this.done = false;
    }

    step() {
        let newState = this.state.slice();
        
        for (var i = 0; i < this.state.length; i++) {
            let prev = (i - 1 + this.state.length) % this.state.length;
            let curr = i;
            let next = (i + 1) % this.state.length;

            let neighborhood = [this.state[prev], this.state[curr], this.state[next]]; 
            let newValue = this.applyRule(neighborhood);
            newState[i] = newValue;
        }

        this.stateHistory.push(this.state.slice());
        this.state = newState.slice();
    }

    applyRule(neighborhood) {
        let neighborhoodString = neighborhood.join("");
        let neighborhoodInt = parseInt(neighborhoodString, 2);

        return this.rule[neighborhoodInt];
    }

    show() {
        let size = width / this.state.length;

        stroke(100);
        strokeWeight(size / 20);

        for (var i = 0; i < this.stateHistory.length; i++) {
            for (var j = 0; j < this.stateHistory[i].length; j++) {
                let x = j * size;
                let y = i * size;
                
                if (y + size > height || x + size > width) {
                    this.done = true;
                }
                
                fill(this.stateHistory[i][j] == "0" ? 0 : 200);
                rect(j * size, i * size, size, size);
            }
        }
    }
}