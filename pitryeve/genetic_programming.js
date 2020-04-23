const InstructionTypes = Object.freeze({ OPERATOR: 0, OPERAND: 1 });

const OperatorTypes = Object.freeze({
    IF: 0,
    DO: 1,
    MOVE_TOWARDS: 2,
    MOVE_RANDOM: 3,
    NEAREST: 4,
    NOOP: 5,
});

const OperandTypes = Object.freeze({
    FOOD: 0
})

class GenInstruction {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
    
    static execute(grid, agent, program, instruction) {        
        switch (instruction.data.type) {
            case InstructionTypes.OPERATOR:
                return this.executeOperator(grid, agent, program, instruction);
            case InstructionTypes.OPERAND:
                return this.retrieveOperand(grid, agent, program, instruction);               
        }
    }

    static executeOperator(grid, agent, program, instruction) {
        let children = program.getChildren(instruction);
        let operator = instruction.data.value;

        switch (operator) {
            case OperatorTypes.NOOP:
                break;
            case OperatorTypes.MOVE_RANDOM:
                let random_dir = Directions.randomDir();
                agent.move(grid, random_dir);
                break;
            case OperatorTypes.MOVE_TOWARDS:
                let target = this.execute(grid, agent, program, children[0]);
                agent.moveTowards(grid, target);
                break;
            case OperatorTypes.NEAREST:
                let tag = this.execute(grid, agent, program, children[0]);
                let nearest_elem = grid.elements.find((f) => f.tags.indexOf(tag) != -1);
                return nearest_elem;
        }

        return null;
    }

    static retrieveOperand(grid, agent, program, instruction) {
        let operand = instruction.data.value;

        switch (operand) {
            case OperandTypes.FOOD:
                return "Food";
            default:
                console.error("This should not be happening.");
                return undefined;
        }
    }
}