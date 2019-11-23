function argmax(list) {
    return list.map((x, i) => [x, i]).reduce((a, b) => a[0] > b[0] ? a : b)[1];
}

class Tile {
    constructor(i, j) {
        this.set(i, j);
    }

    set(i, j) {
        this.i = i;
        this.j = j;
    }

    copy() {
        return new Tile(this.i, this.j);
    }
}