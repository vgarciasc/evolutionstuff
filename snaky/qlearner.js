DEBUG = false;

class QLearner {
    constructor(learning_rate, discount) {
        this.learning_rate = learning_rate;
        this.discount = discount;
        
        this.weights = [];
    }

    init(state) {
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

        var colliding_with = null;
        var nearest_L_obst = null;
        var nearest_R_obst = null;
        var nearest_U_obst = null;
        var nearest_D_obst = null;

        state.elements.forEach((f) => {
            if (f.isTag("Wall") || f.isTag("SnakeBody")) {
                var diff_x = f.pos.x - new_head_pos.x;
                var diff_y = f.pos.y - new_head_pos.y;

                if (diff_x == 0 && diff_y == 0) {
                    colliding_with = f;
                }

                if (f.pos.y == new_head_pos.y) {
                    if (diff_x <= 0 && (!nearest_L_obst || diff_x > (nearest_L_obst.pos.x - new_head_pos.x))) {
                        nearest_L_obst = f;
                    }

                    if (diff_x >= 0 && (!nearest_R_obst || diff_x < (nearest_R_obst.pos.x - new_head_pos.x))) {
                        nearest_R_obst = f;
                    }
                }

                if (f.pos.x == new_head_pos.x) {
                    if (diff_y <= 0 && (!nearest_U_obst || diff_y > (nearest_U_obst.pos.y - new_head_pos.y))) {
                        nearest_U_obst = f;
                    }

                    if (diff_y >= 0 && (!nearest_D_obst || diff_y < (nearest_D_obst.pos.y - new_head_pos.y))) {
                        nearest_D_obst = f;
                    }
                }
            }
        });


        var diff_L = (new_head_pos.x - nearest_L_obst.pos.x) / state.w;
        var diff_R = (nearest_R_obst.pos.x - new_head_pos.x) / state.w;
        var diff_U = (new_head_pos.y - nearest_U_obst.pos.y) / state.h;
        var diff_D = (nearest_D_obst.pos.y - new_head_pos.y) / state.h;
        var diff_vec = [diff_L, diff_R, diff_U, diff_D];

        // bias
        feats.push(1);
        
        // distance to nearest food
        var feat_1 = 0;
        if (food && head) {
            feat_1 = abs((food.pos.x - new_head_pos.x) + (food.pos.y - new_head_pos.y)) / (state.w + state.h);
        }
        feats.push(feat_1);

        // imminence of death by collision
        var feat_2 = 0;
        if (colliding_with && (colliding_with.isTag("SnakeBody") || colliding_with.isTag("Wall"))) {
            feat_2 = 1;
        } else {
            feat_2 = 0;
        }
        feats.push(feat_2);

        var feat_food = 0;
        if (food.pos.x == new_head_pos.x && food.pos.y == new_head_pos.y) {
            feat_food = 1;
        }
        feats.push(feat_food);

        var feat_3 = (diff_L + diff_R + diff_U + diff_D) / 4;
        feats.push(feat_3);

        // var feat_4 = 0;
        // var min_idx = diff_vec.findIndex((f) => f == min(diff_vec));
        // var diff_vec_wout_min = diff_vec.slice(0, min_idx).concat(diff_vec.slice(min_idx + 1));
        // var feat_4 = min(diff_vec_wout_min);
        // feats.push(feat_4);

        // var feat_5 = 0;
        // var min_idx = diff_vec.findIndex((f) => f == min(diff_vec));
        // var diff_vec_wout_min = diff_vec.slice(0, min_idx).concat(diff_vec.slice(min_idx + 1));
        // if (diff_vec_wout_min[0] > 0.2 && diff_vec_wout_min[1] > 0.2 && diff_vec_wout_min[2] > 0.2) {
        //     feat_5 = 1;
        // }
        // feats.push(feat_5);

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

    observe(state, action, nextState, reward, episode_percent=1) {
        var actual = reward + this.discount * this.getValue(nextState);
        var expected = this.getQValue(state, action);

        var diff = actual - expected;
        var feats = this.extractFeatures(state, action);

        for (var i = 0; i < feats.length; i++) {
            var learning_rate = (1 - episode_percent) * this.learning_rate;
            this.weights[i] += learning_rate * diff * feats[i];
        }
    }

    getAction(state, epsilon=0) {
        var possible_as = [];
        var possible_qs = [];

        if (random(1) < epsilon) {
            return random(game.getLegalActions());
        }

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