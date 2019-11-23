var network;

function setup() {
    // network = new Perceptron(3, sigmoid);
    network = new NeuralNetwork(3, 3, 2);
    run();
}

function draw() {
    
}

function run() {
    // let out = network.predict([1, 0.3, 0.8]);
    let out = network.predict([0.2, 0.8, 0.1]);
    print(out);
}

function keyPressed() {
    if (keyCode == BACKSPACE) {
        network.mutate(1);
        run();
    }
}