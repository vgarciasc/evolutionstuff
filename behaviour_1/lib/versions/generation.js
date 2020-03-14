function nextGeneration() {
    let newAgents = [];

    if (GRID) {
        let agents = GRID.objs.filter((f) => f.getName() == "Agent");
        let scores = agents.map((f) => f.score);
        let probs = calculateFitness(scores);

        GRID = new Grid(GRID_W, GRID_H);
        // let debugScores = [];
        // console.log('probs :', probs);
        
        for (var i = 0; i < AGENT_COUNT; i++) {
            // let tile = getNewAgentPosition();
            let tile = new Tile(round(random(0, GRID_W-1)), GRID_H-1);
            let oldAgent = pickFit(probs, agents);
            // if (!debugScores[oldAgent.score.toString()]) {
            //     debugScores[oldAgent.score.toString()] = 0
            // }
            // debugScores[oldAgent.score.toString()]++;

            let agent = new Agent(tile, GRID.tileSize, oldAgent.brain.copy());
            agent.mutate(0.25, 1);
            
            newAgents.push(agent);
        }

        // console.log('debugScores :', debugScores);
    }
    else {
        GRID = new Grid(GRID_W, GRID_H);

        for (var i = 0; i < AGENT_COUNT; i++) {
            let tile = new Tile(round(random(0, GRID_W-1)), GRID_H-1);
            // let tile = getNewAgentPosition();
            let agent = new Agent(tile, GRID.tileSize);
            newAgents.push(agent);
        }
    }

    GRID.addObjects(newAgents);
    
    for (var i = 0; i < FOOD_COUNT; i++) {
        let tile = GRID.getRandomEmptyTile(2, 2);
        GRID.objs.push(new Food(tile, GRID.tileSize));
    }
}
