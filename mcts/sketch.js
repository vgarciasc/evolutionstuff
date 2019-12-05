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

function setup() {
    canvas = createCanvas(300, 300);
    canvas.parent('canvascontainer');
    tileSize = width/3;

    whoseTurnSpan = select("#whoseturn");
    machineControlsArea = select("#machine_controls_area");
    whoseturnArea = select("#whoseturn_area");
    startingPlayerArea = select("#starting_player_area");
    gameOverArea = select("#game_over_area");
    gameOverWinner = select("#game_over_winner");
    mctsTimeoutSlider = select("#mcts_timeout_slider");
    mctsTimeoutSpan = select("#mcts_timeout_span");

    reset();
}

function reset() {
    TTT_BOARD = new TicTacToeBoard();
    whoseTurn = round(random(0, 1));
    stateTransition(GameStates.SELECT_STARTING_PLAYER);
}

function draw() {
    handleHover();
    drawBoard();

    mctsTimeoutSpan.html(mctsTimeoutSlider.value());
}

function drawBoard() {
    stroke(0);
    strokeWeight(1);

    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            let tile = TTT_BOARD.grid[j + i*3];

            if (hoveredTile == (j + i*3) && currentGameState == GameStates.WAITING_HUMAN_MOVE
                && TTT_BOARD.isLegalPosition(j + i*3)) {
                fill(200, 200, 200);
            } else if (tile != "") {
                fill(240, 240, 240);
            } else {
                fill(255, 255, 255);
            }

            rect(j * tileSize, i * tileSize, tileSize, tileSize);
            
            fill(0);
            textSize(40);
            textAlign(CENTER, CENTER);
            text(tile, j * tileSize + tileSize/2, i * tileSize + tileSize/2);
        }
    }
}

function disableEverythingHTML() {
    startingPlayerArea.hide();
    whoseturnArea.hide();
    machineControlsArea.hide();
    gameOverArea.hide();
}

function stateTransition(newGameState) {
    disableEverythingHTML();
    
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

function handleHover() {
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

function selectStartingPlayer(player) {
    whoseTurn = player;
    stateTransition(
        whoseTurn == PLAYER.HUMAN ? 
        GameStates.WAITING_HUMAN_MOVE : 
        GameStates.WAITING_MACHINE_MOVE);
}

function mouseClicked() {
    if (hoveredTile != -1 && whoseTurn == PLAYER.HUMAN && TTT_BOARD.isLegalPosition(hoveredTile)) {
        TTT_BOARD.humanMakeMove(hoveredTile);
        endMove(PLAYER.HUMAN);
    }
}

function machineRandomMove() {
    TTT_BOARD.makeRandomMove(PLAYER.MACHINE);
    endMove(PLAYER.MACHINE);
}

function machineMctsMove() {
    let monteCarlo = new MCTS(TTT_BOARD.copy());
    let bestMove = monteCarlo.runSearch(mctsTimeoutSlider.value());
    TTT_BOARD.makeMove(bestMove);
    endMove(PLAYER.MACHINE);
}

function endMove(player) {
    if (TTT_BOARD.checkWin() != "") {
        stateTransition(GameStates.GAME_OVER);
    } else {
        stateTransition(player == PLAYER.HUMAN ? 
            GameStates.WAITING_MACHINE_MOVE : 
            GameStates.WAITING_HUMAN_MOVE);
    }
}

function makeMove(pos) {
    TTT_BOARD.humanMakeMove(pos);
    TTT_BOARD.print();
    machineMctsMove();
    TTT_BOARD.print();
}