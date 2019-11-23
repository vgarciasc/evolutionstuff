function getNewAgentPosition() {
    let pos_i = -1;
    let pos_j = -1;

    do {
        let dice = random(1);
        if (dice < 0.5) {
            pos_i = round(random(0, GRID.w - 1));
            pos_j = random(1) > 0.5 ? 0 : GRID.h - 1;
        } else {
            pos_i = random(1) > 0.5 ? 0 : GRID.w - 1;   
            pos_j = round(random(0, GRID.h - 1));
        }
    } while (!GRID.isTileEmptyAndValid(pos_i, pos_j));

    return {i: pos_i, j: pos_j};
}

function calculateFitness(list) {
    var scores = list.map((f) => f.score);
    var min = scores.reduce((a, b) => a < b ? a : b);
    scores = scores.map((f) => f - min);

    var fitnesses = scores.map((f) => pow(f, 1));
    var sum = fitnesses.reduce((a, b) => a + b);
    var means = fitnesses.map((f) => f / sum);
    return means;
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