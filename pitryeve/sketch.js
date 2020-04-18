let grid = null;
let main_agent = null;

function setup() {
    let canvas = createCanvas(500, 500);
    canvas.parent('canvascontainer');

    grid = new Grid(10, 10, 50, [], [
        {classname: VyAgent, collidable: [VyAgent, Wall]},
        {classname: Food, collidable: []}
    ]);
    
    main_agent = new VyAgent(createVector(5, 5));
    grid.addElement(main_agent);
    
    grid.addElement(new Food(createVector(7, 7)));
    for (var i = 0; i < 10; i++) {
        grid.addElement(new Wall(createVector(i, 0)));
        grid.addElement(new Wall(createVector(0, i)));
        grid.addElement(new Wall(createVector(i, 9)));
        grid.addElement(new Wall(createVector(9, i)));
    }

    setInterval(() => {
        grid.iterate();
    }, 100);
}

function draw() {
    grid.render();
    select("#activity_span").html(Object.keys(ActivityEnum)[main_agent.crt_activity]);
    select("#hunger_span").html(main_agent.hunger.toFixed(2));
    select("#tiredness_span").html(main_agent.tiredness.toFixed(2));
}