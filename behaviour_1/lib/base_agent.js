class Agent extends GridElement {
    constructor(tile, size, brain = undefined) {
        super(tile, size);
        
        this.padding = this.size / 10;
        this.fov = 1;

        this.score = 0;

        if (brain) {
            this.brain = brain;
        } else {
            this.createBrain();
        }        
    }

    createBrain() {
        //1 for each tile that the agent can see
        let inputNodes = pow(this.fov * 2 + 1, 2);
        
        let outputNodes = 5;
        let hiddenNodes = round((inputNodes + outputNodes) / 2);

        this.brain = new NeuralNetwork(inputNodes, hiddenNodes, outputNodes);
    }
    
    show() {
        stroke(0);
        fill(180, 20, 20); //red
        rect(this.tile.i * this.size + this.padding,
             this.tile.j * this.size + this.padding,
             this.size - 2 * this.padding,
             this.size - 2 * this.padding);
    }
        
    step() {
        // let randomDir = round(random(Object.keys(DIRECTION).length - 1));
        // this.move(randomDir);
        let decision = this.think();
        this.act(decision);
    }

    mutate(rate, force) {
        this.brain.mutate(rate, force);
    }
    
    think() {
        let input = [];

        let fovInput = this.getAdjacents(this.fov);
        fovInput = fovInput.map(this.codify);

        input = input.concat(fovInput);
        
        return this.brain.predict(input);
    }
    
    act(netOutput) {
        let a = argmax(netOutput);
        // let arr = (new Array(netOutput.length)).fill(0).map((f, i) => i);
        // let a = pickFit(netOutput, arr);
        switch (a) {
            case 0: this.move(DIRECTION.UP);    break;
            case 1: this.move(DIRECTION.DOWN);  break;
            case 2: this.move(DIRECTION.LEFT);  break;
            case 3: this.move(DIRECTION.RIGHT); break;
            case 4: /* do nothing */ break;
            default: break;
        }
    }
    
    move(dir) {
        let tile = this.tile.copy();
        
        switch (dir) {
            case DIRECTION.UP:    tile.j -= 1; break;
            case DIRECTION.DOWN:  tile.j += 1; break;
            case DIRECTION.LEFT:  tile.i -= 1; break;
            case DIRECTION.RIGHT: tile.i += 1; break;
        }
        
        if (!GRID.isTileValid(tile)) return;

        let element = GRID.elementAt(tile);
        if (element) {
            if (element.getName() == "Food") {
                element.destroy();
                this.score += 10;
            } else {
                return;
            }
        }

        this.tile.set(tile.i, tile.j);
    }
    
    codify(gridElementName) {
        if (!gridElementName) return 0;
        
        let code = 0;
        let possibleElements = 3;
        
        switch (gridElementName) {
            case "Agent": code = 1; break;
            case "Food": code = 2; break;
            case "Wall": code = 3; break;
        }
        
        return code / possibleElements;
    }

    getAdjacents(d) {
        let output = [];
        for (var j = -d; j < d + 1; j++) {
            for (var i = -d; i < d + 1; i++) {
                let tile = new Tile(this.tile.i + i, this.tile.j + j);

                let elem = GRID.elementAt(tile);
                let elemName = elem ? GRID.elementAt(tile).getName() : undefined;
                
                // if (!GRID.isTileValid(tile)) {
                //     elemName = "Wall";
                // }

                output[(j + d) * (d * 2 + 1) + (i + d)] = elemName;
            }
        }

        return output;
    }
}