let game = null;
let game_size = {w: 25, h: 25}

let qlearner = null;

function setup() {
    let canvas = createCanvas(500, 500);
    canvas.parent('canvascontainer');

    // qlearner = new NeuralNetworkQLearner(0.2, 0.9)
    qlearner = new QLearner(0.3, 0.9)

    qlearner.init(makeGame());

    let episodes = 1000;
    for (var i = 0; i < episodes; i++) {
        game = makeGame();

        if (i % 10 == 0) {
            // debugger;
            console.log("finished episode #" + i + ", score: " + game.score);
            // console.log(qlearner.weights);
        }

        let k = 0;
        while (!game.isGameOver) {
            k++;
            if (k > 10000) {
                console.error("should check...");
                game.isGameOver = true;
            }

            game.lastDirectionPressed = qlearner.getAction(game, 0.5);
            let observation = game.iterate();
            game = observation.nextState;
            qlearner.observe(observation.state, observation.action, observation.nextState, observation.reward, i / episodes);
        }
    }

    // console.log(qlearner.weights);

    game = makeGame();
    setInterval(() => {
        if (!game.isGameOver) {
            game.lastDirectionPressed = qlearner.getAction(game);
            let observation = game.iterate();
            game = observation.nextState;
        } else {
            console.log(game.score);
        }
    }, 50);
}

function draw() {
    game.render();
}

function keyPressed() {
    if (keyCode == LEFT_ARROW && game.lastDirectionPressed != DirEnum.RIGHT) {
        game.lastDirectionPressed = DirEnum.LEFT;
        return false;
    } else if (keyCode == RIGHT_ARROW && game.lastDirectionPressed != DirEnum.LEFT) {
        game.lastDirectionPressed = DirEnum.RIGHT;
        return false;
    } else if (keyCode == UP_ARROW && game.lastDirectionPressed != DirEnum.UP) {
        game.lastDirectionPressed = DirEnum.DOWN;
        return false;
    } else if (keyCode == DOWN_ARROW && game.lastDirectionPressed != DirEnum.DOWN) {
        game.lastDirectionPressed = DirEnum.UP;
        return false;
    }
}

function makeGame() {
    let game = new Game(game_size.w, game_size.h, 20, [], [
        {classname: SnakeHead, collidable: [SnakeBody, Wall]},
        {classname: SnakeBody, collidable: [SnakeBody]},
        {classname: Food, collidable: []},
        {classname: Wall, collidable: []}
    ]);

    game.init();
    game.bgcolor = color(0);

    game.addElement(new SnakeHead(createVector(5, 5)));
    game.addElement(new SnakeBody(createVector(5, 4), game.elements[0]));
    game.addElement(new SnakeBody(createVector(5, 3), game.elements[1]));
    game.addElement(new Food(createVector(7, 7)));

    for (var i = 0; i < game_size.w; i++) { game.addElement(new Wall(createVector(i, 0))); }
    for (var i = 0; i < game_size.h; i++) { game.addElement(new Wall(createVector(0, i))); }
    for (var i = 0; i < game_size.h; i++) { game.addElement(new Wall(createVector(game_size.w - 1, i))); }
    for (var i = 0; i < game_size.w; i++) { game.addElement(new Wall(createVector(i, game_size.h - 1))); }

    return game;
}

function iterate() {

}