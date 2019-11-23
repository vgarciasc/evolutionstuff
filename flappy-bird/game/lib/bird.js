/// <reference path="./p5.global-mode.d.ts" />

function Bird() {
    this.y = height/2;
    this.x = 25;

    this.size = 32;

    this.gravity = 0.5;
    this.velocity = 0;
    this.maxVelocity = 10;
    this.lift = -8;

    this.show = () => {
        fill(255);
        ellipse(this.x, this.y, this.size);
    }

    this.update = () => {
        this.velocity += this.gravity;
        this.velocity *= 0.9;
        this.y += this.velocity;

        // clamp position
        this.y = Math.max(0 + this.size/2, Math.min(this.y, (height - this.size/2)));
        // clamp velocity
        this.velocity = Math.max(-this.maxVelocity, Math.min(this.velocity, this.maxVelocity));
    }

    this.up = () => {
        this.velocity += this.lift;
    }
}