class MCTS {
    constructor(model) {
        this.model = model;

        this.root = new GameNode(null, null);
        this.nodeList = [this.root];
    }

    runSearch(timeout=1) {
        let end = Date.now() + timeout * 1000;

        while (Date.now() < end) {
        // for (var i = 0; i < 100; i++) {
            let selectRes = this.select(this.root, this.model.copy());
            let selectLeaf = selectRes.node;
            let selectModel = selectRes.model;

            let expandRes = this.expand(selectLeaf, selectModel);
            let expandLeaf = expandRes.node;
            let expandModel = expandRes.model;

            let simulationWinner = this.simulate(expandLeaf, expandModel);

            this.backpropagate(expandLeaf, simulationWinner);
        }

        let bestMove = this.root.children.reduce((a, b) => a.simulations > b.simulations ? a : b).move;
        return bestMove;
    }

    getBestChildUCB1(node) {
        let nodeScores = node.children.map((f) => [f, UCB1(f, node)]);
        return nodeScores.reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }

    select(node, model) {
        while (!node.isLeaf() && this.isFullyExplored(node, model)) {
            node = this.getBestChildUCB1(node);
            model.makeMove(node.move);
        }

        return {node: node, model: model};
    }

    expand(node, model) {
        let legalPositions = this.getAvailablePlays(node, model);
        let randomPos = legalPositions[round(random(legalPositions.length - 1))];
        
        let otherPlayer = null;
        if (node.isRoot()) { 
            otherPlayer = PLAYER.MACHINE;
        } else { 
            otherPlayer = (node.move.player == PLAYER.HUMAN) ? PLAYER.MACHINE : PLAYER.HUMAN;
        }
        
        let randomMove = new GameMove(otherPlayer, randomPos); 
        model.makeMove(randomMove);

        let newChild = new GameNode(node, randomMove);
        this.nodeList.push(newChild);

        let nodeIndex = this.nodeList.indexOf(node);
        this.nodeList[nodeIndex].children.push(newChild);

        return {node: newChild, model: model};
    }

    simulate(node, model) {
        let currentPlayer = node.move.player;

        while (model.checkWin() == "") {
            currentPlayer = (currentPlayer == PLAYER.MACHINE) ? PLAYER.HUMAN : PLAYER.MACHINE;
            model.makeRandomMove(currentPlayer);
        }

        return model.checkWin();
    }

    backpropagate(node, winner) {
        node.simulations += 1;
        if (!node.isRoot()) {
            if ((node.move.player == PLAYER.MACHINE && winner == "m") ||
                (node.move.player == PLAYER.HUMAN   && winner == "h")) {
                node.value += 1;
            }
            if ((node.move.player == PLAYER.MACHINE && winner == "h") ||
                (node.move.player == PLAYER.HUMAN   && winner == "m")) {
                node.value -= 1;
            }
        
            this.backpropagate(node.parent, winner);
        }
    }

    isFullyExplored(node, model) {
        return this.getAvailablePlays(node, model).length == 0;
    }

    getAvailablePlays(node, model) {
        let legalPositions = model.getLegalPositions();
        return legalPositions.filter((pos) => {
            let explored = node.children.find((child) => child.move.position == pos);
            return !explored;
        });
    }
}

class GameNode {
    constructor(parent, move) {
        this.parent = parent;
        this.move = move;

        this.value = 0;
        this.simulations = 0;
        this.children = [];
    }

    isLeaf() {
        return this.children.length == 0;
    }

    isRoot() {
        return this.move == null || this.move == undefined;
    }
}

function UCB1(node, parent) {
    let exploitation = node.value / node.simulations;
    let exploration = Math.sqrt(2 * Math.log(parent.simulations) / node.simulations);
    return exploitation + exploration;
}