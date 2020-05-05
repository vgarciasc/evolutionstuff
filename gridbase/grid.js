class Grid {
    constructor(w, h, tile_size, elements = [], collisions = [], bgcolor = color(220)) {
        this.w = w;
        this.h = h;
        this.tile_size = tile_size;
        this.elements = elements;
        this.collisions = collisions;
        this.bgcolor = bgcolor;
    }

    render() {
        background(this.bgcolor);

        this.elements.forEach((f) => {
            push();

            translate(f.pos.x * this.tile_size, f.pos.y * this.tile_size);
            f.render(this.tile_size);
            
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
            f.iterate(this);
        });
    }

    addElement(element) {
        this.elements.push(element);
    }

    removeElement(element) {
        let idx = this.elements.findIndex((f) => f == element);
        this.elements.splice(idx, 1);
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
}