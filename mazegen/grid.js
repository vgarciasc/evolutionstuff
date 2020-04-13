class Grid {
    constructor(w, h, tile_w, tile_h, elements = [], collisions = []) {
        this.w = w;
        this.h = h;
        this.tile_w = tile_w;
        this.tile_h = tile_h;
        this.elements = elements;
        this.collisions = collisions;
    }

    render() {
        background(220);

        this.elements.forEach((f) => {
            push();

            translate(f.pos.x * this.tile_w, f.pos.y * this.tile_h);
            f.render(this.tile_w, this.tile_h);
            
            pop();
        });
    }

    isEmpty(pos) {
        return this.getAt(pos) == null;
    }

    getAt(pos) {
        return this.elements.find((f) => f.pos.equals(pos));
    }

    canMove(elem, pos) {
        return !this.shouldCollide(elem, this.getAt(pos));
    }

    iterate() {
        this.elements.forEach((f) => {
            f.iterate();
        });
    }

    addElement(element) {
        this.elements.push(element);
    }

    shouldCollide(elem_1, elem_2) {
        if (elem_1 == null || elem_1 == undefined 
            || elem_2 == null || elem_2 == undefined) {
            return false;
        }

        let elem_1_collision_data = (this.collisions.find((f) => elem_1.constructor.name == f.classname.name));
        let elem_2_collision_data = (this.collisions.find((f) => elem_2.constructor.name == f.classname.name));

        if (!elem_1_collision_data && !elem_2_collision_data) return false;

        return  (elem_1_collision_data.collidable
                    .find((f) => elem_2.constructor.name == f.name)
                        != null) ||
                (elem_2_collision_data.collidable
                    .find((f) => elem_1.constructor.name == f.name)
                        != null);
    }

    getNeighbors(elem) {
        return this.elements.filter((f) => 
            (f.pos.x == (elem.pos.x - 1) && f.pos.y == (elem.pos.y + 0)) ||
            (f.pos.x == (elem.pos.x + 1) && f.pos.y == (elem.pos.y + 0)) ||
            (f.pos.x == (elem.pos.x + 0) && f.pos.y == (elem.pos.y - 1)) ||
            (f.pos.x == (elem.pos.x + 0) && f.pos.y == (elem.pos.y + 1)) ||
            (f.pos.x == (elem.pos.x + 1) && f.pos.y == (elem.pos.y + 1)) ||
            (f.pos.x == (elem.pos.x + 1) && f.pos.y == (elem.pos.y - 1)) ||
            (f.pos.x == (elem.pos.x - 1) && f.pos.y == (elem.pos.y + 1)) ||
            (f.pos.x == (elem.pos.x - 1) && f.pos.y == (elem.pos.y - 1)));
    }
}