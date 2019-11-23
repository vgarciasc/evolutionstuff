/// <reference path="./p5.global-mode.d.ts" />

class Boid {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.velocity = createVector(0, 1);
        this.acceleration = createVector(0, 0);

        this.r = 10;
        this.maxVelocity = 3;
        this.maxForce = 0.1;

        this.sensorRadius = this.r * 5;
        this.fieldOfView = 50;

        // this.showDebug = true;
        this.showDebug = false;
    }

    show() {
        let theta = this.velocity.heading() + PI/2;
        stroke(255);
        fill(255, 50);

        push();
        translate(this.position.x, this.position.y);
        rotate(theta);
        beginShape();
        vertex(0, -this.r*1.2);
        vertex(-this.r, this.r*2);
        vertex(this.r, this.r*2);
        endShape(CLOSE);
        pop();
    }

    applyForce(force) {
        this.acceleration.add(force);
    }

    update() {
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxVelocity);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
    }

    seek(target) {
        let desiredVelocity = p5.Vector.sub(target, this.position);
        desiredVelocity.normalize();
        desiredVelocity.mult(this.maxVelocity);

        let steering = p5.Vector.sub(desiredVelocity, this.velocity);
        steering.limit(this.maxForce);
        return steering;
    }

    flee(target) {
        let desiredVelocity = p5.Vector.sub(target, this.position);
        desiredVelocity.normalize();
        desiredVelocity.mult(-this.maxVelocity);

        let steering = p5.Vector.sub(desiredVelocity, this.velocity);
        steering.limit(this.maxForce);
        return steering;
    }

    arrive(target) {
        let desiredVelocity = p5.Vector.sub(target, this.position);
        let distance = desiredVelocity.mag();

        let slowdownRadius = 50;
        let slowdownMultiplier = map(distance, 0, slowdownRadius, 0, this.maxVelocity);

        desiredVelocity.normalize();
        desiredVelocity.mult(slowdownMultiplier);

        let steering = p5.Vector.sub(desiredVelocity, this.velocity);
        steering.limit(this.maxForce);
        return steering;
    }

    follow(targetBoid) {
        let targetPosition = targetBoid.position.copy();
        let targetVelocity = targetBoid.velocity.copy();
        targetVelocity.normalize();
        targetVelocity.mult(5);
        targetPosition.add(targetVelocity);
        return this.seek(targetPosition);
    }

    wander() {
        let foresight = 100;
        let circleRadius = 20;

        let foresightVector = this.velocity.copy().normalize();
        foresightVector.mult(foresight);

        let circleCenter = p5.Vector.add(this.position, foresightVector);

        let randomAngle = 0;
        if (!this.lastWanderAngle) {
            this.lastWanderAngle = random(TWO_PI);
        }

        randomAngle = this.lastWanderAngle + random(-0.1, 0.1);
        this.lastWanderAngle = randomAngle;

        let desiredPoint = createVector(cos(randomAngle), sin(randomAngle));
        desiredPoint.mult(circleRadius);
        desiredPoint.add(circleCenter);
        
        // debug gizmos
        if (this.showDebug) {
            stroke(0, 255, 0);
            fill(0, 0, 0, 0);
            line(this.position.x, this.position.y, circleCenter.x, circleCenter.y);
            ellipse(circleCenter.x, circleCenter.y, circleRadius * 2);
            line(circleCenter.x, circleCenter.y, desiredPoint.x, desiredPoint.y);
        }

        return this.seek(desiredPoint);
    }

    constrain() {
        let bounds = 40;
        let desiredVelocity = this.velocity.copy();

        if (this.position.x < bounds) {
            desiredVelocity.x = this.maxVelocity;
        } else if (this.position.x > width - bounds) {
            desiredVelocity.x = - this.maxVelocity;
        }
        
        if (this.position.y < bounds) {
            desiredVelocity.y = this.maxVelocity;
        } else if (this.position.y > height - bounds) {
            desiredVelocity.y = - this.maxVelocity;
        }

        let steering = p5.Vector.sub(desiredVelocity, this.velocity);
        steering.limit(this.maxForce);
        return steering;
    }

    separate(boids) {
        if (boids.length === 0) return createVector(0, 0);

        let sum = createVector(0, 0);

        boids.forEach((f) => {
            let diff = p5.Vector.sub(this.position, f.position);
            diff.normalize();
            sum.add(diff);
        });

        let average = sum.div(boids.length);
        average.setMag(this.maxVelocity);

        let steering = p5.Vector.sub(this.velocity, average);
        steering.limit(-this.maxForce);
        return steering;
    }

    align(boids) {
        if (boids.length === 0) return createVector(0, 0);

        let sum = createVector(0, 0);

        boids.forEach((f) => {
            sum.add(f.velocity);
        });

        let average = sum.div(boids.length);
        average.setMag(this.maxVelocity);

        let steering = p5.Vector.sub(this.velocity, average);
        steering.limit(-this.maxForce);
        return steering;
    }

    cohesion(boids) {
        let closeBoids = boids.filter((f) => {
            let d = p5.Vector.dist(this.position, f.position);
            let angle = this.velocity.angleBetween(p5.Vector.sub(f.position, this.position));
            angle *= (180 / PI);
            return (d > 0) && (d < this.sensorRadius * 2) && (angle < this.fieldOfView);
        });
        
        if (closeBoids.length === 0) return createVector(0, 0);

        let sum = createVector(0, 0);
        closeBoids.forEach((f) => {
            sum.add(f.position);
        });

        let average = sum.div(closeBoids.length);
        return this.seek(average);
    }

    applyBehaviours(boids) {
        let nearestBoids = this.getNearestBoids(boids);
        let visibleBoids = this.getVisibleBoids(nearestBoids);

        let separate = this.separate(nearestBoids);
        let align = this.align(visibleBoids);
        let cohesion = this.cohesion(nearestBoids);
        let constrain = this.constrain();
        let wander = this.wander();
        // let seek = this.seek(createVector(mouseX, mouseY));
        
        separate.mult(2);
        align.mult(1);
        cohesion.mult(1);
        constrain.mult(4);
        wander.mult(1);
        // seek.mult(0.5);

        this.applyForce(separate);
        this.applyForce(align);
        this.applyForce(cohesion);
        this.applyForce(wander);
        this.applyForce(constrain);
        // this.applyForce(seek);
    }

    getNearestBoids(boids) {
        return boids.filter((f) => {
            let d = p5.Vector.dist(this.position, f.position);
            return (d > 0) && (d < this.sensorRadius * 2);
        });
    }

    getVisibleBoids(boids) {
        return boids.filter((f) => {
            let angle = this.velocity.angleBetween(p5.Vector.sub(f.position, this.position));
            angle *= (180 / PI);
            return (angle < this.fieldOfView);
        });
    }
}