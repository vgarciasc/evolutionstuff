function createModel() {
    const model = tf.sequential(); 

    model.add(tf.layers.dense({inputShape: [2], units: 1, useBias: true}));
    model.add(tf.layers.dense({units: 1, useBias: true}));

    return model;
}

function convertToTensor(data) {
    return tf.tidy(() => {
        const inputs = data.map(d => d.in);
        const labels = data.map(d => d.out);

        const inputTensor = tf.tensor2d(inputs, [inputs.length / 2, 2]);
        const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

        return {
            inputs: inputTensor,
            labels: labelTensor
        }
    });  
}

async function run() {
    const model = createModel();
    var data = [
        {"in": [0, 0], "out": 0}
    ];
    
    var tensorData = convertToTensor(data);
    var {inputs, labels} = tensorData;
    
    tf.tidy(() => {
        model.predict(tf.tensor2d([0, 0], [1, 2])).print();
        model.predict(tf.tensor2d([0, 1], [1, 2])).print();
    });
}

document.addEventListener('DOMContentLoaded', run);