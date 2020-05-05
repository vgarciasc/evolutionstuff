DEBUG = false;

class QLearner {
    constructor(learning_rate, discount) {
        this.learning_rate = learning_rate;
        this.discount = discount;
        
        this.weights = [];
    }

    init(state) {
        this.weights.push(0); //bias

        var feats = this.extractFeatures(state, state.getLegalActions()[0]);
        for (var i = 0; i < feats.length; i++) {
            this.weights.push(0);
        }
    }

    extractFeatures(state, action) {
        var feats = [];
        let action_dir = Directions.getVec(action);
        
        var food = state.elements.find((f) => f.isTag("Food"));
        var head = state.elements.find((f) => f.isTag("SnakeHead"));
        var new_head_pos = p5.Vector.add(head.pos, action_dir);
        var colliding_with = state.getAt(new_head_pos);

        // bias
        feats.push(1);
        
        // distance to closest food
        var feat_1 = 0;
        if (food && head) {
            feat_1 = abs((food.pos.x - new_head_pos.x) + (food.pos.y - new_head_pos.y)) / (state.w + state.h);
        }
        feats.push(feat_1);

        if (DEBUG) { debugger; }

        // imminence of death by collision
        var feat_2 = 0;
        if (colliding_with && (colliding_with.isTag("SnakeBody") || colliding_with.isTag("Wall"))) {
            feat_2 = 1;
        } else {
            feat_2 = 0;
        }
        feats.push(feat_2);

        //TODO: edit to make sense
        // var feat_3 = 0;
        // var dist_left = 1;
        // for (var i = 0; i < new_head_pos.x; i++) {
        //     let elem = state.getAt(createVector(i, new_head_pos.y));
        //     if (elem && (elem.isTag("Wall") || elem.isTag("SnakeBody"))) {
        //         dist_left = (new_head_pos.x - i) / state.w;
        //     }
        // }
        // var dist_right = 1;
        // for (var i = new_head_pos.x + 1; i < state.w; i++) {
        //     let elem = state.getAt(createVector(i, new_head_pos.y));
        //     if (elem && (elem.isTag("Wall") || elem.isTag("SnakeBody"))) {
        //         dist_right = (i - new_head_pos.x - 1) / state.w;
        //     }
        // }
        // var dist_up = 1;
        // for (var i = 0; i < new_head_pos.y; i++) {
        //     let elem = state.getAt(createVector(new_head_pos.x, i));
        //     if (elem && (elem.isTag("Wall") || elem.isTag("SnakeBody"))) {
        //         dist_up = (new_head_pos.y - i) / state.h;
        //     }
        // }
        // var dist_down = 1;
        // for (var i = new_head_pos.y + 1; i < state.h; i++) {
        //     let elem = state.getAt(createVector(i, new_head_pos.x));
        //     if (elem && (elem.isTag("Wall") || elem.isTag("SnakeBody"))) {
        //         dist_down = (i - new_head_pos.y - 1) / state.h;
        //     }
        // }
        // feat_3 = (dist_down + dist_left + dist_up + dist_right) / 4;
        // feats.push(feat_3);

        return feats;
    }

    getValue(state) {
        var possible_qs = [];

        game.getLegalActions().forEach((action) => {
            possible_qs.push(this.getQValue(state, action));
        });

        if (possible_qs.length > 0) {
            return max(possible_qs);
        } else {
            return 0;
        }
    }

    getQValue(state, action) {
        var total = 0;
        var feats = this.extractFeatures(state, action);
        
        for (var i = 0; i < feats.length; i++) {
            total += this.weights[i] * feats[i];
        }

        return total;
    }

    observe(state, action, nextState, reward) {
        var actual = reward + this.discount * this.getValue(nextState);
        var expected = this.getQValue(state, action);

        var diff = actual - expected;
        var feats = this.extractFeatures(state, action);

        for (var i = 0; i < feats.length; i++) {
            this.weights[i] += this.learning_rate * diff * feats[i];
        }
    }

    getAction(state) {
        var possible_as = [];
        var possible_qs = [];

        game.getLegalActions().forEach((action) => {
            possible_as.push(action);
            possible_qs.push(this.getQValue(state, action));
        });

        let best_q = max(possible_qs);
        let tied_as = [];
        for (var i = 0; i < possible_as.length; i++) {
            if (possible_qs[i] == best_q) {
                tied_as.push(possible_as[i]);
            }
        }

        return random(tied_as);
    }
}