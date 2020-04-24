class Operand { 
    constructor(name) {
        this.type = "Operand";
        this.name = name;
    }
}

class Operator { 
    constructor(name, arity) {
        this.type = "Operator";
        this.name = name;
        this.arity = arity;
    }
}

const OperandTypes = Object.freeze({
    FOOD: new Operand("Food"),
    WALL: new Operand("Wall")
})

const OperatorTypes = Object.freeze({
    IF: new Operator("IF", 3),
    DO: new Operator("DO", -1),
    MOVE_TOWARDS: new Operator("MOVE_TOWARDS", 1),
    MOVE_RANDOM: new Operator("MOVE_RANDOM", 0),
    NEAREST: new Operator("NEAREST", 1),
    NOOP: new Operator("NOOP", 0),
});

class GenInstruction {
    constructor(val) {
        this.val = val;
    }
}

class GenProgram {    
    static execute(grid, agent, program, instruction) {        
        switch (instruction.data.val.type) {
            case "Operator":
                return this.executeOperator(grid, agent, program, instruction);
            case "Operand":
                return this.retrieveOperand(grid, agent, program, instruction);               
        }
    }

    static executeOperator(grid, agent, program, instruction) {
        let children = program.getChildren(instruction);
        let operator = instruction.data.val;

        switch (operator.name) {
            case "IF":
                if (this.execute(grid, agent, program, children[0])) {
                    this.execute(grid, agent, program, children[1]);
                } else if (children.length > 2) {
                    this.execute(grid, agent, program, children[2]);
                }
                break;
            case "NOOP":
                break;
            case "MOVE_RANDOM":
                let random_dir = Directions.randomDir();
                agent.move(grid, random_dir);
                break;
            case "MOVE_TOWARDS":
                let target = this.execute(grid, agent, program, children[0]);
                agent.moveTowards(grid, target);
                break;
            case "NEAREST":
                let tag = this.execute(grid, agent, program, children[0]);
                let nearest_elem = grid.elements.find((f) => f.tags.indexOf(tag) != -1);
                //TODO: not getting nearest!
                return nearest_elem;
        }

        return null;
    }

    static retrieveOperand(grid, agent, program, instruction) {
        let operand = instruction.data.val;
        switch (operand.name) {
            case "Food":
            case "Wall":
                return operand.name; 
            default:
                console.error("This should not be happening.");
                return undefined;
        }
    }

    // static mutate(program) {

    // }
}