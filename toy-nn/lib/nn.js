function sigmoid(x) {
    return 1 / (1 + Math.pow(Math.E, -x));
}

function softmax(arr) {
    return arr.map(function(val, i) { 
        return Math.exp(val) / arr.map(function(y) { return Math.exp(y) } ).reduce( function(a, b) { return a + b });
    });
}

class Perceptron {
    constructor(inputNodes, activationFunction) {
        // bias is the last weight
        this.weights = new Array(inputNodes + 1).fill(0);

        this.activationFunction = activationFunction;
        this.initialize();
    }

    initialize() {
        this.weights = this.weights.map((w) => Math.random());
    }

    predict(input) {
        let sum = this.weights[this.weights.length - 1]; //bias
        for (var i = 0; i < this.weights.length - 1; i++) {
            sum += this.weights[i] * input[i];
        }

        return this.activationFunction(sum);
    }

    mutate(rate, force = 1) {
        this.weights = this.weights.map((w) => {
            let dice = Math.random();
            if (dice < rate) {
                w += (Math.random() - 0.5) * force;
            }
            return w;
        });
    }

    copy() {
        let copy = new Perceptron(0, this.activationFunction);
        copy.weights = this.weights.slice();
        return copy;
    }
}

class NeuralNetwork {
    constructor(inputNodes, hiddenNodes, outputNodes) {
        this.hidden = [];
        for (var i = 0; i < hiddenNodes; i++) {
            this.hidden.push(new Perceptron(inputNodes, sigmoid));
        }
        
        this.output = [];
        for (var i = 0; i < outputNodes; i++) {
            this.output.push(new Perceptron(hiddenNodes, sigmoid));
        }
    }
    
    predict(input) {
        var hiddenLayerOutput = [];
        this.hidden.forEach((node) => {
            let out = node.predict(input);
            hiddenLayerOutput.push(out);
        });

        var outputLayerOutput = [];
        this.output.forEach((node) => {
            let out = node.predict(hiddenLayerOutput);
            outputLayerOutput.push(out);
        });

        return softmax(outputLayerOutput);
    }

    copy() {
        let copy = new NeuralNetwork(0, 0, 0);
        this.hidden.forEach((node) => copy.hidden.push(node.copy()) );
        this.output.forEach((node) => copy.output.push(node.copy()) );
        return copy;
    }

    mutate(rate, force = 1) {
        this.hidden.forEach((node) => node.mutate(rate, force));
        this.output.forEach((node) => node.mutate(rate, force));
    }
}