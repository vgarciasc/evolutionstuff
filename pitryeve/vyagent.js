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
                this.lapeActivity(grid);
                break;
            case ActivityEnum.MOKU:
                this.mokuActivity(grid);
                break;
        }
    }

    handleHealth(grid) {
        if (this.hunger * this.tiredness > 0.6) {
            //die
            grid.removeElement(this);
        }
    }

    updateNecessities() {
        this.hunger = constrain(this.hunger + 0.025, 0, 1);
        this.tiredness = constrain(this.tiredness - 0.05, 0, 1);
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

    lapeActivity(grid) {
        //noop
    }

    mokuActivity(grid) {
        let nearest_food = grid.elements.find((f) => f.tags.indexOf("Food") != -1);
        if (nearest_food) {
            this.moveTowards(grid, nearest_food.pos);
        } else {
            let random_dir = Directions.randomDir();
            this.move(grid, random_dir);
        }
    }

    move(grid, dir) {
        super.move(grid, dir);
        this.tiredness = constrain(this.tiredness + 0.1, 0, 1);
    }

    onCollide(grid, collided) { 
        if (collided.isTag("Food")) {
            grid.removeElement(collided);
        }
    }
}