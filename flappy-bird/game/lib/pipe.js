/// <reference path="./p5.global-mode.d.ts" />

function Pipe() {
    this.space = random(80, 110);
    this.center = random(this.space/2, height - this.space/2);
    this.w = 30;
    
    this.x = width;

    this.show = () => {
        fill(255);
        rect(this.x, 0, this.w, this.center - this.space/2);
        rect(this.x, this.center + this.space/2, this.w, height - this.center + this.space/2);
    }

    this.update = (speed) => {
        this.x -= speed;
    }

    this.offscreen = () => {
        return (this.x < - this.w);
    }

    this.hits = (bird) => {
        return this.rectIntersect(this.x, 0, this.w, this.center - this.space/2, bird.x - bird.size/2, bird.y - bird.size/2, bird.size, bird.size)
                || this.rectIntersect(this.x, this.center + this.space/2, this.w, height - this.center + this.space/2, bird.x - bird.size/2, bird.y - bird.size/2, bird.size, bird.size);
    }

    this.rectIntersect = (r1_x, r1_y, r1_w, r1_h, r2_x, r2_y, r2_w, r2_h) => {
        x_overlap = Math.max(0, Math.min(r1_x + r1_w, r2_x + r2_w) - Math.max(r1_x, r2_x));
        y_overlap = Math.max(0, Math.min(r1_y + r1_h, r2_y + r2_h) - Math.max(r1_y, r2_y));
        overlapArea = x_overlap * y_overlap;
        return overlapArea > 0;
    }
}