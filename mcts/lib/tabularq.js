class TabularQ {
    constructor(player) {
        this.player = player;

        this.table = {};
        this.history = [];
    }

    getNextAction(board, useRandom=false) {
        let action = undefined;
        if (useRandom) {
            let legalMoves = board.getLegalPositions();
            let randomMove = round(random(legalMoves.length - 1));
            action = legalMoves[randomMove];
        } else {
            action = this.bestAction(board);
        }

        this.history.unshift({action: action, state: board.copy()});
        return action;
    }

    bestAction(board) {
        let actions = this.lookupBoard(board);
        // if (actions.length == 0) debugger;
        return actions.reduce((a, b) => a.q_value > b.q_value ? a : b);
    }

    lookupAction(board, action) {
        let hash = this.hashBoard(board);
        let boardEntry = this.lookupBoard(board);

        let actionEntry = boardEntry.find((f) => f.action == action.action);
        if (actionEntry == undefined) {
            // debugger;
            actionEntry = this.newAction(action);
            this.table[hash].push(actionEntry);
        }

        return actionEntry;
    }

    lookupBoard(board) {
        let hash = this.hashBoard(board);
        if (this.table[hash] == undefined) {
            this.table[hash] = [];
            board.getLegalPositions().forEach((f) => this.table[hash].push(this.newAction(f)));
        }

        return this.table[hash];
    }

    updateQ(board, action, new_q) {
        let hash = this.hashBoard(board);
        this.table[hash]
            .filter((f) => f.action == action.action)
            .map((f) => f.q_value = new_q);
    }

    learnGameOver(board) {
        let reward = this.boardReward(board);
        let LEARNING_RATE = 0.1;
        let DISCOUNT = 0.95;

        // debugger;
        for (var i = 0; i < this.history.length; i++) {
            let action = this.history[i].action;
            let state = this.history[i].state;
            
            let new_state = state.copy();
            new_state.makeMove(new GameMove(PLAYER.MACHINE, action.action))

            let cur_q = this.lookupAction(state, action).q_value;
            let max_q = (i == 0) ? 0 : this.bestAction(new_state).q_value;
            let new_q = 0;
            
            if (i != 0) {
                new_q = (1 - LEARNING_RATE) * (cur_q) 
                        + (LEARNING_RATE) * (reward + DISCOUNT * max_q);
            } else {
                new_q = reward;
            }

            this.updateQ(state, action, new_q);
        }
    }

    newAction(position, q_value = 0.2) {
        return { "action": position, "q_value": q_value };
    }

    hashBoard(board) {
        return board.grid.map((f) => f == "" ? "_" : f).join("");
    }

    boardReward(board) {
        switch (board.checkWin()) {
            case "h": return this.player == PLAYER.HUMAN ? 1 : -1;
            case "m": return this.player == PLAYER.MACHINE ? 1 : -1;
            case "v": return +0;
            default: console.error("This should not be happening");
        }
    }

    undoAction(board, action) {
        board.grid[action] = "";
        return board;
    }

    reset() {
        this.history = [];
    }
}