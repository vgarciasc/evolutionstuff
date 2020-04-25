let grid = null;
let main_agent = null;

function setup() {
    let canvas = createCanvas(500, 500);
    canvas.parent("canvas_vis");

    // setupOneoff();
    let final_pop = runGenerations(100, 100);
    setupOneoff(final_pop[0]);
}

function draw() {
    if (grid) {
        grid.render();
    }

    if (main_agent) {
        select("#activity_span").html(Object.keys(ActivityEnum)[main_agent.crt_activity]);
        select("#hunger_span").html(main_agent.hunger.toFixed(2));
        select("#tiredness_span").html(main_agent.tiredness.toFixed(2));
        select("#fitness_span").html(main_agent.calculateFitness().toFixed(2));
    }
}

function setupOneoff(programs) {
    if (!programs) {
        // let moku_prog = new Tree(new Node(new GenInstruction(OperatorTypes.IF)));
        // moku_prog.insert(new Node(new GenInstruction(OperatorTypes.NEAREST)), moku_prog.get(0));
        // moku_prog.insert(new Node(new GenInstruction(OperandTypes.FOOD)), moku_prog.get(1));
        // moku_prog.insert(new Node(new GenInstruction(OperatorTypes.MOVE_TOWARDS)), moku_prog.get(0));
        // moku_prog.insert(new Node(new GenInstruction(OperatorTypes.NEAREST)), moku_prog.get(3));
        // moku_prog.insert(new Node(new GenInstruction(OperandTypes.FOOD)), moku_prog.get(4));
        // moku_prog.insert(new Node(new GenInstruction(OperatorTypes.MOVE_RANDOM)), moku_prog.get(0));
        
        let moku_prog = randomProgram();
        programs = [randomProgram(), moku_prog];
    }
    
    grid = initializeGrid();
    main_agent = createAgent([programs[0], programs[1]]);
    grid.addElement(main_agent);

    let real_time = true;
    if (real_time) {
        let k = 0;
        setInterval(() => {
            if (k < 50) { k++; grid.iterate(); }
        }, 100);
    } else {
        for (var i = 0; i < 50; i++) {
            grid.iterate();
        }
    }

    tree_vis_p5.updateTree(main_agent.programs.MOKU);
}

function runGenerations(pop_size=100, iterations=10) {
    let population = [];

    // Seeding the initial population with programs
    for (var i = 0; i < pop_size; i++) {
        population.push([
            randomProgram(), //lape
            randomProgram(), //moku
        ]);
    }

    // Iterating until criteria
    for (var k = 0; k < iterations; k++) {
        let sum_fitnesses = 0;
        
        // Calculating each fitness
        for (var i = 0; i < pop_size; i++) {
            let grid = initializeGrid();
            
            let agent = createAgent(population[i]);
            grid.addElement(agent);
            
            for (var j = 0; j < 50; j++) {
                grid.iterate();
            }

            let fit = agent.calculateFitness();
            population[i].fit = fit;
            sum_fitnesses += fit;
        }

        // Sorting according to fitness
        population.sort((a, b) => a.fit > b.fit ? -1 : 1);
        
        // Calculating selection probabilities
        let fitnesses = population.map((a) => a.fit);
        let probs = fitnesses.map((a) => a / sum_fitnesses);

        // Generating new population
        let new_pop = [];
        let top_n = pop_size / 10;

        for (var i = 0; i < top_n; i++) {
            new_pop.push(population[i]);
        }

        for (var i = top_n; i < pop_size; i++) {
            let indiv = pickFit(probs, population);
            let new_indiv = [];

            for (var j = 0; j < indiv.length; j++) {
                new_indiv.push(GenProgram.mutate(indiv[j]));
            }

            new_pop.push(new_indiv);
        }

        population = new_pop;
    }

    return population;
}

function initializeGrid() {
    let grid = new Grid(10, 10, 50, [], [
        {classname: VyAgent, collidable: [VyAgent, Wall]},
        {classname: Food, collidable: []}
    ]);
    
    grid.addElement(new Food(createVector(7, 7)));
    grid.addElement(new Food(createVector(3, 3)));

    for (var i = 0; i < 10; i++) {
        grid.addElement(new Wall(createVector(i, 0)));
        grid.addElement(new Wall(createVector(0, i)));
        grid.addElement(new Wall(createVector(i, 9)));
        grid.addElement(new Wall(createVector(9, i)));
    }

    return grid;
}

function createAgent(programs) {
    let agent = new VyAgent(createVector(5, 5));
    agent.initializePrograms(
        programs[0].copy(),
        programs[1].copy());
    return agent;    
}

function randomProgram() {
    let program = new Tree(new Node(new GenInstruction(OperatorTypes.IF)));
    program.insert(new Node(new GenInstruction(OperatorTypes.NOOP)), program.get(0));
    program.insert(new Node(new GenInstruction(OperatorTypes.NOOP)), program.get(0));
    program.insert(new Node(new GenInstruction(OperatorTypes.NOOP)), program.get(0));
    return program;
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