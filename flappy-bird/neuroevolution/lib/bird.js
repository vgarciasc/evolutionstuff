/// <reference path="./p5.global-mode.d.ts" />

class Bird {
    constructor(brainModel) {
        this.x = 25;
        this.y = height/2;
        this.velocity = 0;
        this.score = 0;

        this.size = 16;
        this.lift = -8;
        this.gravity = 0.5;
        this.maxVelocity = 10;

        this.active = true;

        this.brain = new Birdbrain(4, 4, 2);
        this.brain.setModel(brainModel);
    }

    show() {
        stroke(255)
        fill(255, 100);
        ellipse(this.x, this.y, this.size);
    }

    update() {
        this.velocity += this.gravity;
        this.velocity *= 0.9;
        this.y += this.velocity;

        // clamp position
        this.y = Math.max(0 + this.size/2, Math.min(this.y, (height - this.size/2)));
        // clamp velocity
        this.velocity = Math.max(-this.maxVelocity, Math.min(this.velocity, this.maxVelocity));

        this.score += 1;
    }

    kill() {
        this.active = false;
    }

    up() {
        this.velocity += this.lift;
    }

    think(env) {
        var closest_pipe = env.pipes
            .filter((f) => f.x > this.x)
            .reduce((prev, curr) => prev.x < curr.x ? prev : curr);
        
        var inputs = [];
        inputs[0] = this.y / height;
        inputs[1] = closest_pipe.center / height;
        inputs[2] = closest_pipe.space / height;
        inputs[3] = closest_pipe.x / width;
        
        var output = this.brain.predict(inputs);
        if (output[0] > 0.5) {
            this.up();
        }
    }

    mutate() {
        this.brain.mutate(0.1);
    }
}