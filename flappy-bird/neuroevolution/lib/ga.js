function nextGeneration() {
    counter = 1;

    if (birds.length === 0) {
        for (var i = 0; i < TOTAL_POPULATION; i++) {
            birds.push(new Bird(null));
        }
        return;
    }

    newBirds = [];
    var probs = calculateFitness();
    // var selections = {};
    for (var i = 0; i < TOTAL_POPULATION; i++) {
        var oldBird = pickFit(probs, birds);
        var newBird = new Bird(oldBird.brain.copyModel());
        newBird.mutate();
        newBirds.push(newBird);
        // if (selections[oldBird.score] > 0) selections[oldBird.score] += 1;
        // else selections[oldBird.score] = 1;
    }

    // print(selections);
    birds = newBirds;
}

function pickFit(prob, list) {
    var index = 0;
    var r = random(1);

    while (r > 0) {
        r -= prob[index];
        index++;
    }

    index--;
    return list[index];
}

function calculateFitness() {
    var fitnesses = birds.map((f) => pow(f.score, 3));
    var sum = fitnesses.reduce((a, b) => a + b);
    var means = fitnesses.map((f) => f / sum);
    return means;
}