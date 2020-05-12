class Game extends Grid {
    init() {
        this.score = 0;
        this.lastDirectionPressed = DirEnum.DOWN;
        this.isGameOver = false;
    }

    getLegalActions() {
        let legals = [];

        switch (this.lastDirectionPressed) {
            case DirEnum.LEFT: legals = [DirEnum.UP, DirEnum.DOWN, DirEnum.LEFT]; break;
            case DirEnum.RIGHT: legals = [DirEnum.UP, DirEnum.DOWN, DirEnum.RIGHT]; break;
            case DirEnum.UP: legals = [DirEnum.LEFT, DirEnum.RIGHT, DirEnum.UP]; break;
            case DirEnum.DOWN: legals = [DirEnum.LEFT, DirEnum.RIGHT, DirEnum.DOWN]; break;
        }

        return legals;
    }

    deepCopy() {
        let copy = new Game(this.w, this.h, this.tile_size, [], this.collisions, this.bgcolor);

        copy.score = this.score;
        copy.lastDirectionPressed = this.lastDirectionPressed;
        copy.isGameOver = this.isGameOver;

        for (var i = 0; i < this.elements.length; i++) {
            let elem = this.elements[i];
            if (elem.isTag("SnakeHead")) {
                copy.addElement(new SnakeHead(elem.pos.copy()));
            } else if (elem.isTag("SnakeBody")) {
                copy.addElement(new SnakeBody(elem.pos.copy(), elem.parentElem));
            } else {
                copy.addElement(elem.deepCopy());
            }
        }

        for (var i = 0; i < copy.elements.length; i++) {
            let elem = copy.elements[i];
            if (elem.isTag("SnakeBody")) {
                elem.parentElem = copy.getAt(elem.parentElem.pos);
            }
        }

        return copy;
    }

    addAnotherBody() {
        let bodies = this.elements.filter((f) => f.isTag("SnakeBody"));
        let lastBody = bodies[bodies.length - 1];
    
        this.addElement(new SnakeBody(lastBody.pos.copy(), lastBody));
    }

    consume(food) {
        this.removeElement(food);
        this.addAnotherBody();
        this.score += 1;
        this.spawnFood();
    }

    spawnFood() {
        this.addElement(new Food(createVector(round(random(2, this.w - 2)), round(random(2, this.h - 2)))));
    }

    die() {
        this.score -= 99;
        this.isGameOver = true;
    }

    iterate() {
        let state = this;
        let action = this.lastDirectionPressed;
        
        let nextState = this.deepCopy();
        nextState.elements.forEach((f) => {
            f.iterate(nextState);
        });
        
        let reward = (nextState.score - state.score);

        return {state: state, action: action, nextState: nextState, reward: reward};
    }
}