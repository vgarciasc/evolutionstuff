/// <reference path="./lib/p5.global-mode.d.ts" />

let TTT_BOARD;
let canvas;

var whoseTurn;
var hoveredTile = -1;
var tileSize;

var whoseTurnSpan;
var machineControlsArea;
var whoseturnArea;
var startingPlayerArea;
var gameOverArea;
var gameOverWinner;
var mctsTimeoutSlider;
var mctsTimeoutSpan;

const GameStates = Object.freeze({ 
    SELECT_STARTING_PLAYER: 0, 
    WAITING_HUMAN_MOVE: 1,
    WAITING_MACHINE_MOVE: 2,
    GAME_OVER: 3
});
var currentGameState;

const s = (sketch) => {
  sketch.setup = () => {
    canvas = sketch.createCanvas(100, 100);
    tileSize = sketch.width/3;

    whoseTurnSpan = sketch.select("#whoseturn");
    machineControlsArea = sketch.select("#machine_controls_area");
    whoseturnArea = sketch.select("#whoseturn_area");
    startingPlayerArea = sketch.select("#starting_player_area");
    gameOverArea = sketch.select("#game_over_area");
    gameOverWinner = sketch.select("#game_over_winner");
    mctsTimeoutSlider = sketch.select("#mcts_timeout_slider");
    mctsTimeoutSpan = sketch.select("#mcts_timeout_span");

    sketch.reset();
  };

  sketch.draw = () => {
    sketch.handleHover();
    sketch.drawBoard();

    mctsTimeoutSpan.html(mctsTimeoutSlider.value());
  };

  sketch.reset = () => {
    TTT_BOARD = new TicTacToeBoard();
    whoseTurn = sketch.round(sketch.random(0, 1));
    sketch.stateTransition(GameStates.SELECT_STARTING_PLAYER);
  }

  sketch.drawBoard = () => {
        sketch.stroke(0);
        sketch.strokeWeight(1);

        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                let tile = TTT_BOARD.grid[j + i*3];

                if (hoveredTile == (j + i*3) && currentGameState == GameStates.WAITING_HUMAN_MOVE
                    && TTT_BOARD.isLegalPosition(j + i*3)) {
                    sketch.fill(200, 200, 200);
                } else if (tile == "h") {
                    sketch.fill(100, 100, 240);
                } else if (tile == "m") {
                    sketch.fill(240, 100, 100);
                } else {
                    sketch.fill(255, 255, 255);
                }

                sketch.rect(j * tileSize, i * tileSize, tileSize, tileSize);
                
                sketch.fill(0);
                sketch.textSize(40);
                sketch.textAlign(sketch.CENTER, sketch.CENTER);
                sketch.text(tile, j * tileSize + tileSize/2, i * tileSize + tileSize/2);
            }
        }
    }

    sketch.disableEverythingHTML = () => {
        startingPlayerArea.hide();
        whoseturnArea.hide();
        machineControlsArea.hide();
        gameOverArea.hide();
    }

    sketch.stateTransition = (newGameState) => {
        sketch.disableEverythingHTML();
        
        switch (newGameState) {
            case GameStates.SELECT_STARTING_PLAYER:
                startingPlayerArea.show();
                break;
            case GameStates.WAITING_HUMAN_MOVE:
                whoseTurn = PLAYER.HUMAN;
                whoseturnArea.show();
                whoseTurnSpan.html(whoseTurn == PLAYER.HUMAN ? "HUMAN" : "MACHINE");
                break;
            case GameStates.WAITING_MACHINE_MOVE:
                whoseTurn = PLAYER.MACHINE;
                whoseturnArea.show();
                whoseTurnSpan.html(whoseTurn == PLAYER.HUMAN ? "HUMAN" : "MACHINE");
                machineControlsArea.show();
                break;
            case GameStates.GAME_OVER:
                gameOverArea.show();
                let winner = TTT_BOARD.checkWin();
                switch (winner) {
                    case "h": winner = "HUMAN"; break;
                    case "m": winner = "MACHINE"; break;
                    case "v": winner = "DRAW"; break;
                }
                gameOverWinner.html(winner);
                break;
        }

        currentGameState = newGameState;
    }

    sketch.handleHover = () => {
        let mouseX = sketch.mouseX;
        let mouseY = sketch.mouseY;
        
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                if (mouseX > (j * tileSize) && mouseX < ((j+1) * tileSize)
                    && mouseY > (i * tileSize) && mouseY < ((i+1) * tileSize)) {
                    hoveredTile = j + i*3;
                    return;
                }
            }
        }

        hoveredTile = -1;
    }

    sketch.selectStartingPlayer = (player) => {
        whoseTurn = player;
        sketch.stateTransition(
            whoseTurn == PLAYER.HUMAN ? 
            GameStates.WAITING_HUMAN_MOVE : 
            GameStates.WAITING_MACHINE_MOVE);
    }

    sketch.mouseClicked = () => {
        if (hoveredTile != -1 && whoseTurn == PLAYER.HUMAN && TTT_BOARD.isLegalPosition(hoveredTile)) {
            TTT_BOARD.humanMakeMove(hoveredTile);
            sketch.endMove(PLAYER.HUMAN);
        }
    }

    sketch.machineRandomMove = () => {
        TTT_BOARD.makeRandomMove(PLAYER.MACHINE);
        sketch.endMove(PLAYER.MACHINE);
    }

    sketch.machineMctsMove = () => {
        let monteCarlo = new MCTS(TTT_BOARD.copy(), PLAYER.MACHINE);
        let MCTS_search = monteCarlo.runSearch(mctsTimeoutSlider.value());
        TTT_BOARD.makeMove(MCTS_search.move);
        sketch.endMove(PLAYER.MACHINE);
        setMCTS(monteCarlo, MCTS_search);
    }

    sketch.machineGaMove = () => {
        let monteCarlo = new MCTS(TTT_BOARD.copy());
        let bestMove = monteCarlo.runSearch(mctsTimeoutSlider.value());
        TTT_BOARD.makeMove(bestMove);
        sketch.endMove(PLAYER.MACHINE);
    }

    sketch.endMove = (player) => {
        if (TTT_BOARD.checkWin() != "") {
            sketch.stateTransition(GameStates.GAME_OVER);
        } else {
            sketch.stateTransition(player == PLAYER.HUMAN ? 
                GameStates.WAITING_MACHINE_MOVE : 
                GameStates.WAITING_HUMAN_MOVE);
        }
    }

    sketch.makeMove = (pos) => {
        TTT_BOARD.humanMakeMove(pos);
        TTT_BOARD.print();
        sketch.machineMctsMove();
        TTT_BOARD.print();
    }

    sketch.trainTabularQ = () => {
        let results = {};
        let epochs = 65000;

        let epsilon = 0.5;
        let EPSILON_START_DECAY = sketch.round(2 * epochs / 4);
        let EPSILON_FNISH_DECAY = sketch.round(3 * epochs / 4);
        let epsilon_decay_value = epsilon / (EPSILON_FNISH_DECAY - EPSILON_START_DECAY);

        let total = 0;
        let start_counting_total = 0.8 * epochs;
        
        let QAgent = new TabularQ(PLAYER.MACHINE);
        for (var i = 0; i < epochs; i++) {
            // debugger;
            QAgent.reset();
            let board = new TicTacToeBoard();
            let whoseTurn = sketch.round(sketch.random(0, 1));

            while (board.checkWin() == "") {
                if (whoseTurn == PLAYER.HUMAN) {
                    board.makeRandomMove(PLAYER.HUMAN);
                } else {
                    let action = null;
                    if (random() < epsilon) {
                        action = QAgent.getNextAction(board, useRandom=true);
                    } else {
                        action = QAgent.getNextAction(board, useRandom=false);
                    }

                    board.makeMove(new GameMove(PLAYER.MACHINE, action.action));
                }
                
                whoseTurn = (whoseTurn == PLAYER.HUMAN) ? PLAYER.MACHINE : PLAYER.HUMAN;
            }

            if (i >= EPSILON_START_DECAY && i <= EPSILON_FNISH_DECAY) {
                epsilon -= epsilon_decay_value;
            }

            // debugger;
            QAgent.learnGameOver(board, epsilon);

            results[board.checkWin()] = (results[board.checkWin()] != undefined) ? 
                (results[board.checkWin()] + 1) : 0;

            if (i % 100 == 0) { 
                print(results);
                results = {};
            }

            if (i > start_counting_total) {
                switch (board.checkWin()) {
                    case "m": total += 1; break;
                    case "h": total -= 1; break;
                }
            }
        }

        print("-- end:");
        print(results);
        print(total / (epochs - start_counting_total));
    }

    sketch.trainTabularQ12 = () => {
        let results = {};
        let epochs = 10000;

        let total = 0;
        
        let QAgent1 = new TabularQ(PLAYER.MACHINE);
        let QAgent2 = new TabularQ(PLAYER.HUMAN);
        for (var i = 0; i < epochs; i++) {
            // debugger;
            QAgent1.reset();
            QAgent2.reset();
            let board = new TicTacToeBoard();
            let whoseTurn = sketch.round(sketch.random(0, 1));

            while (board.checkWin() == "") {
                if (whoseTurn == PLAYER.MACHINE) {
                    let action = QAgent1.getNextAction(board);
                    board.makeMove(new GameMove(PLAYER.MACHINE, action.action));
                } else {
                    let action = QAgent2.getNextAction(board);
                    board.makeMove(new GameMove(PLAYER.HUMAN, action.action));
                }
                
                whoseTurn = (whoseTurn == PLAYER.HUMAN) ? PLAYER.MACHINE : PLAYER.HUMAN;
            }

            // debugger;
            QAgent1.learnGameOver(board);
            QAgent2.learnGameOver(board);

            results[board.checkWin()] = (results[board.checkWin()] != undefined) ? 
                (results[board.checkWin()] + 1) : 0;

            if (i % 100 == 0) { 
                print(results);
                total += (results["m"] != undefined) ? results["m"] : 0;
                results = {};
            }
        }

        print("-- end:");
        print(results);
        print(total / epochs);
        debugger;
    }
};

let myp5 = new p5(s, "canvascontainer");

function testMCTS() {
    let results = {"h": 0, "m": 0, "v": 0};
    for (var i = 0; i < 2; i++) {
        let board = new TicTacToeBoard();
        
        let player = myp5.int(myp5.random(2)) % 2 == 1 ? PLAYER.MACHINE : PLAYER.HUMAN;
        while (board.checkWin() == "") {
            if (player == PLAYER.MACHINE) {
                let mcts_model = new MCTS(board.copy());
                let mcts_search = mcts_model.runSearch(2);

                let move = mcts_search.move;
                move.player = player;
                board.makeMove(move);
            } else {
                board.makeRandomMove(player);
            }

            // board.print();

            player = player == PLAYER.MACHINE ? PLAYER.HUMAN : PLAYER.MACHINE;
        }

        if (i % 10 == 0) { console.log("i: " + i); };
        results[board.checkWin()] += 1;
    }

    console.log(results);


    // sketch.machineRandomMove = () => {
    //     TTT_BOARD.makeRandomMove(PLAYER.MACHINE);
    //     sketch.endMove(PLAYER.MACHINE);
    // }

    // sketch.machineMctsMove = () => {
    //     let monteCarlo = new MCTS(TTT_BOARD.copy());
    //     let MCTS_search = monteCarlo.runSearch(mctsTimeoutSlider.value());
    //     TTT_BOARD.makeMove(MCTS_search.move);
    //     sketch.endMove(PLAYER.MACHINE);
    //     setMCTS(monteCarlo, MCTS_search);
    // }
}