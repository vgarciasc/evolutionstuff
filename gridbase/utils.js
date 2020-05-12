function debugBreak() {
    console.error("this should not be happening!");
}

const DirEnum = Object.freeze({
    "UP": 0,
    "DOWN": 1,
    "LEFT": 2,
    "RIGHT": 3 });

class Directions {
    static randomDir() {
        let dice = round(random(0, 3));
        switch (dice) {
            case 0: return createVector(  1,  0 );
            case 1: return createVector(  0,  1 );
            case 2: return createVector( -1,  0 );
            case 3: return createVector(  0, -1 );
            default: debugBreak(); return null;
        }
    }

    static getVec(dirEnum) {
        switch (dirEnum) {
            case DirEnum.UP:    return createVector(  0, -1 );
            case DirEnum.DOWN:  return createVector(  0,  1 );
            case DirEnum.LEFT:  return createVector( -1,  0 );
            case DirEnum.RIGHT: return createVector(  1,  0 );
            default: debugBreak(); return null;
        }
    }
}

function throwError() {
    console.error("This should not be happening.");
}