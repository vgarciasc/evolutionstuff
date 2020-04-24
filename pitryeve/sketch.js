let grid = null;
let main_agent = null;

function setup() {
    let canvas = createCanvas(500, 500);
    canvas.parent("canvas_vis");

    grid = new Grid(10, 10, 50, [], [
        {classname: VyAgent, collidable: [VyAgent, Wall]},
        {classname: Food, collidable: []}
    ]);
    
    main_agent = createAgent();
    grid.addElement(main_agent);
    
    grid.addElement(new Food(createVector(7, 7)));
    grid.addElement(new Food(createVector(3, 3)));
    for (var i = 0; i < 10; i++) {
        grid.addElement(new Wall(createVector(i, 0)));
        grid.addElement(new Wall(createVector(0, i)));
        grid.addElement(new Wall(createVector(i, 9)));
        grid.addElement(new Wall(createVector(9, i)));
    }

    setInterval(() => {
        grid.iterate();
    }, 100);

    tree_vis_p5.updateTree(main_agent.programs.MOKU);
}

function draw() {
    grid.render();
    select("#activity_span").html(Object.keys(ActivityEnum)[main_agent.crt_activity]);
    select("#hunger_span").html(main_agent.hunger.toFixed(2));
    select("#tiredness_span").html(main_agent.tiredness.toFixed(2));
}

function createAgent() {
    let agent = new VyAgent(createVector(5, 5));
    
    let lapeProgram = new Tree(new Node(new GenInstruction(OperatorTypes.NOOP)));
        
    // let mokuProgram = new Tree(new Node(new GenInstruction(OperatorTypes.MOVE_TOWARDS)));
    // mokuProgram.insert(new Node(new GenInstruction(OperatorTypes.NEAREST)), mokuProgram.get(0));
    // mokuProgram.insert(new Node(new GenInstruction(OperandTypes.FOOD)), mokuProgram.get(1));

    let mokuProgram = new Tree(new Node(new GenInstruction(OperatorTypes.IF)));
    mokuProgram.insert(new Node(new GenInstruction(OperatorTypes.NEAREST)), mokuProgram.get(0));
    mokuProgram.insert(new Node(new GenInstruction(OperandTypes.FOOD)), mokuProgram.get(1));
    mokuProgram.insert(new Node(new GenInstruction(OperatorTypes.MOVE_TOWARDS)), mokuProgram.get(0));
    mokuProgram.insert(new Node(new GenInstruction(OperatorTypes.NEAREST)), mokuProgram.get(3));
    mokuProgram.insert(new Node(new GenInstruction(OperandTypes.FOOD)), mokuProgram.get(4));
    mokuProgram.insert(new Node(new GenInstruction(OperatorTypes.MOVE_RANDOM)), mokuProgram.get(0));
    
    // let mokuProgram = new Tree(new Node(new GenInstruction(InstructionTypes.OPERATOR, OperatorTypes.MOVE_RANDOM)));
    
    agent.initializePrograms(mokuProgram, lapeProgram);
    return agent;    
}