class Birdbrain {
    constructor(input_nodes, hidden_nodes, output_nodes) {
        this.input_nodes = input_nodes;
        this.hidden_nodes = hidden_nodes;
        this.output_nodes = output_nodes;
    }

    setModel(model) {
        if (model) {
            this.model = model;
        } else {
            this.model = this.createModel();
        }
    }

    copyModel() {
        return tf.tidy(() => {
            const modelCopy = this.createModel();
            const weights = this.model.getWeights();
            modelCopy.setWeights(weights);
            return modelCopy;
        });
    }

    mutate(rate) {
        tf.tidy(() => {
            const weights = this.model.getWeights();
            const mutatedWeights = [];
            weights.forEach((tensor) => {
                let shape = tensor.shape;
                let values = tensor.dataSync().slice();
                values = values.map((value) => {
                    var dice = random(1);
                    if (dice < rate) {
                        return value + randomGaussian();
                    }
                    return value;
                });
                let newTensor = tf.tensor(values, shape);
                mutatedWeights.push(newTensor);
            });
            this.model.setWeights(mutatedWeights);
        });
    }

    createModel() {
        const model = tf.sequential(); 
        model.add(tf.layers.dense({
            inputShape: [this.input_nodes],
            units: this.hidden_nodes,
            activation: 'sigmoid'}));
        model.add(tf.layers.dense({
            units: this.output_nodes,
            activation: 'softmax'}));
        return model;
    }

    predict(data) {
        return tf.tidy(() => {
            var input_tensor = tf.tensor2d([data]);
            var output_tensor = this.model.predict(input_tensor);
            var outputs = output_tensor.dataSync().slice();
            return outputs;
        });
    }

    saveModel() {
        var output = [];
        tf.tidy(() => {
            const weights = this.model.getWeights();
            weights.forEach((tensor, i) => {
                let values = tensor.dataSync().slice();
                output[i] = [];
                values = values.map((value) => {
                    output[i].push(value);
                });
            });
        });
        print(JSON.stringify(output));
        return output;
    }
}