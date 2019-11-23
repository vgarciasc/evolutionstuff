function createModel() {
    // Create a sequential model
    const model = tf.sequential(); 
    
    // Add a single hidden layer
    model.add(tf.layers.dense({inputShape: [1], units: 1, useBias: true}));
    
    // Add an output layer
    model.add(tf.layers.dense({units: 1, useBias: true}));
    
    return model;
}

function convertToTensor(data) {
    return tf.tidy(() => {
        // Step 1. Shuffle the data    
        tf.util.shuffle(data);
        
        // Step 2. Convert data to Tensor
        const inputs = data.map(d => d.in).flat();
        const labels = data.map(d => d.out);

        const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
        const labelTensor = tf.tensor2d(labels, [labels.length, 1]);
        
        //Step 3. Normalize the data to the range 0 - 1 using min-max scaling
        const inputMax = inputTensor.max();
        const inputMin = inputTensor.min();  
        const labelMax = labelTensor.max();
        const labelMin = labelTensor.min();
        
        const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
        const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));
        
        return {
            inputs: normalizedInputs,
            labels: normalizedLabels,
            inputMax,
            inputMin,
            labelMax,
            labelMin,
        }
    });  
}

async function trainModel(model, inputs, labels) {
    // Prepare the model for training.  
    model.compile({
        optimizer: tf.train.adam(),
        loss: tf.losses.meanSquaredError,
        metrics: ['mse'],
    });
    
    const batchSize = 4;
    const epochs = 20;
    
    return await model.fit(inputs, labels, {
        batchSize,
        epochs,
        shuffle: true
    });
}

async function run() {
    const model = createModel();
    // var data = [
    //     {"in": [0, 0], "out": 0},
    //     {"in": [0, 1], "out": 1},
    //     {"in": [1, 0], "out": 1},
    //     {"in": [1, 1], "out": 1}
    // ];
    
    var data = [
        {"in": 0, "out": 1},
        {"in": 1, "out": 0},
        {"in": 0, "out": 1},
        {"in": 1, "out": 0}
    ];
    
    var tensorData = convertToTensor(data);
    var {inputs, labels} = tensorData;
    console.log('inputs :', inputs.print());
    console.log('labels :', labels.print());
    
    await trainModel(model, inputs, labels);
    console.log('Done Training');

    debugger;
}

document.addEventListener('DOMContentLoaded', run);