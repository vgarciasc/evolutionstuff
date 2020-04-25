const ActivityEnum = Object.freeze({
    LAPE: 0,
    MOKU: 1
});
    
class VyAgent extends GridElement {
    defineFields() {
        this.crt_activity = ActivityEnum.LAPE;
        this.hunger = 0;
        this.tiredness = 0;
    }

    initializePrograms(lapeProgram, mokuProgram) {
        this.programs = {
            LAPE: lapeProgram,
            MOKU: mokuProgram
        };
    }

    render(tile_size) {
        strokeWeight(0);
        fill(200, 20, 20);
        rect(0, 0, tile_size, tile_size);
    }

    iterate(grid) {
        this.updateNecessities();
        this.updateActivity();

        this.handleHealth(grid);

        //act
        switch (this.crt_activity) {
            case ActivityEnum.LAPE:
                this.executeProgram(grid, this.programs.LAPE);
                break;
            case ActivityEnum.MOKU:
                this.executeProgram(grid, this.programs.MOKU);
                break;
        }
    }

    handleHealth(grid) {
        if (this.hunger * this.tiredness > 0.6) {
            //die
            // grid.removeElement(this);
        }
    }

    updateNecessities() {
        let damper = 0.25;

        this.hunger = constrain(this.hunger + 0.1 * damper, 0, 1);
        this.tiredness = constrain(this.tiredness + (0.05 - (1 - this.hunger) * 0.01) * damper, 0, 1);
    }

    updateActivity() {
        let utilities = [ 
            {
                util: this.hunger,
                actv: ActivityEnum.MOKU
            },
            {
                util: this.tiredness,
                actv: ActivityEnum.LAPE
            }
        ];

        let max_util = utilities.sort((a, b) => a.util < b.util ? 1 : -1)[0];
        this.crt_activity = max_util.actv;
    }

    executeProgram(grid, program) {
        GenProgram.execute(grid, this, program, program.get(0));
    }
    
    calculateFitness() {
        return 1 - this.hunger * this.tiredness;
    }

    move(grid, dir) {
        super.move(grid, dir);
        this.tiredness = constrain(this.tiredness + 0.02, 0, 1);
    }

    onCollide(grid, collided) { 
        if (collided.isTag("Food")) {
            grid.removeElement(collided);
            this.hunger = constrain(this.hunger - 0.5, 0, 1);
        }
    }
}