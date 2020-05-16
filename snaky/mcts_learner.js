const ExtendedActions = Object.freeze({
    "UP": 0,
    "DOWN": 1,
    "LEFT": 2,
    "RIGHT": 3,
    "UP_UNTIL_OBST": 4,
    "DOWN_UNTIL_OBST": 5,
    "LEFT_UNTIL_OBST": 6,
    "RIGHT_UNTIL_OBST": 7,
});

class MctsLearner extends Learner {
    constructor(timeout) {
        super();

        this.timeout = timeout;
    }

    getAction(model) {
        this.model = model;
        this.baseScore = model.score;

        let root = new Node(new GameNode(null));
        this.tree = new Tree(root);

        return (this.runSearch(this.timeout)) % 4;
    }

    runSearchIteration() {
        let selectRes = this.select(this.model.deepCopy());
        let selectLeaf = selectRes.node;
        let selectModel = selectRes.model;

        let expandRes = this.expand(selectLeaf, selectModel);
        let expandLeaf = expandRes.node;
        let expandModel = expandRes.model;

        let simulation = this.simulate(expandLeaf, expandModel);

        this.backpropagate(expandLeaf, simulation.score_gain);
    }

    runSearch(timeout=1, iterations=1000) {
        let end = Date.now() + timeout * 1000;

        while (Date.now() < end) {
            
            // for (var i = 0; i < iterations; i++) {
                this.runSearchIteration();
        }
        debugger;

        let best_move_node = this.tree.getChildren(this.tree.get(0)).reduce((a, b) => a.data.simulations > b.data.simulations ? a : b);
        return best_move_node.data.move;
    }

    getBestChildUCB1(node) {
        let nodeScores = this.tree.getChildren(node).map((f) => [f, UCB1(f, node)]);
        return nodeScores.reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }

    select(model) {
        let node = this.tree.get(0);

        while (!node.isLeaf() && this.isFullyExplored(node, model)) {
            node = this.getBestChildUCB1(node);
            model = this.makeMove(model, node.data.move);
        }

        return {node: node, model: model};
    }

    expand(node, model) {
        let expandedNode = null;

        if (!model.isGameOver) {
            let availableActions = this.getAvailableActions(node, model);
            let randomAction = random(availableActions);

            model = this.makeMove(model, randomAction);

            expandedNode = new Node(new GameNode(randomAction));
            this.tree.insert(expandedNode, node);
        } else {
            expandedNode = node;
        }

        return {
            node: expandedNode,
            model: model
        };
    }

    simulate(node, model) {
        let iterations = 0;

        while (!model.isGameOver) {
            let randomMove = random(this.getLegalActions(model));
            // let randomMove = random(model.getLegalActions());
            model = this.makeMove(model, randomMove);
        }

        return {
            score_gain: model.score + 98 - this.baseScore
        };
    }

    backpropagate(node, score_gain) {
        node.data.simulations += 1;
        
        if (!node.isRoot()) {
            node.data.value += score_gain;
            this.backpropagate(this.tree.getParent(node), score_gain * 0.9);
        }
    }

    isFullyExplored(node, model) {
        return this.getAvailableActions(node, model).length == 0;
    }

    getAvailableActions(node, model) {
        let children = this.tree.getChildren(node);
        return this.getLegalActions(model).filter((action) => {
            let explored = children.find((child) => child.data.move == action);
            return !explored;
        });
    }

    getLegalActions(model) {
        let actions = model.getLegalActions();
        let output = [];
        for (var i = 0; i < actions.length; i++) {
            output.push(actions[i]);
            output.push(actions[i] + 4);
        }
        return output;
    }

    makeMove(model, actionDir) {
        let living_reward = 0.01;

        model.lastDirectionPressed = (actionDir % 4);
        model.score += living_reward;
        
        if (actionDir < 4) {
            return model.iterate().nextState;
        } else {
            let state = model.iterate().nextState;
            let nextState = state;

            while (!nextState.isGameOver) {
                state = nextState;
                state.score += living_reward;
                var iteration = state.iterate();
                nextState = iteration.nextState;
            }

            return state;
        }
    }
}

class GameNode {
    constructor(move) {
        this.move = move;
        this.value = 0;
        this.simulations = 0;
    }

    copy() {
        var new_game_node = new GameNode(this.move == null ? null : this.move.copy());
        new_game_node.value = this.value;
        new_game_node.simulations = this.simulations;
        return new_game_node;
    }
}

function UCB1(node, parent) {
    let exploitation = node.data.value / node.data.simulations;
    let exploration = Math.sqrt(2 * Math.log(parent.data.simulations) / node.data.simulations);
    return exploitation + exploration;
}