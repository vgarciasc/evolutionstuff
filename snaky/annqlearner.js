var Neuron = synaptic.Neuron,
	Layer = synaptic.Layer,
	Network = synaptic.Network,
	Trainer = synaptic.Trainer,
    Architect = synaptic.Architect;

function Perceptron(input, hidden, output) {
	// create the layers
    var inputLayer = new Layer(input);
	var hiddenLayer = new Layer(hidden);
	var outputLayer = new Layer(output);
    
    inputLayer.set({
        squash: Neuron.squash.ReLU,
        bias: 0
    });
    hiddenLayer.set({
        squash: Neuron.squash.ReLU,
        bias: 0
    });
    outputLayer.set({
        squash: Neuron.squash.ReLU,
        bias: 0
    });

	// connect the layers
	inputLayer.project(hiddenLayer);
	hiddenLayer.project(outputLayer);

	// set the layers
	this.set({
		input: inputLayer,
		hidden: [hiddenLayer],
		output: outputLayer
	});
}

// extend the prototype chain
Perceptron.prototype = new Network();
Perceptron.prototype.constructor = Perceptron;

class NeuralNetworkQLearner {
    constructor(learning_rate, discount) {
        this.learning_rate = learning_rate;
        this.discount = discount;
    }
    
    init(state) {
        var feats = this.extractFeatures(state, state.getLegalActions()[0]);
        this.perceptron = new Perceptron(
            feats.length,
            feats.length,
            [ DirEnum.UP, DirEnum.RIGHT, DirEnum.DOWN, DirEnum.LEFT ].length
            // state.getLegalActions().length
        );
    }

    actionToIdx(action) {
        return [ DirEnum.UP, DirEnum.RIGHT, DirEnum.DOWN, DirEnum.LEFT ].indexOf(action);
    }

    extractFeatures(state) {
        var feats = [];
        // let action_dir = Directions.getVec(action);
        
        var food = state.elements.find((f) => f.isTag("Food"));
        var head = state.elements.find((f) => f.isTag("SnakeHead"));

        var colliding_with = null;
        var nearest_L_obst = null;
        var nearest_R_obst = null;
        var nearest_U_obst = null;
        var nearest_D_obst = null;

        state.elements.forEach((f) => {
            if (f.isTag("Wall") || f.isTag("SnakeBody")) {
                var diff_x = f.pos.x - head.pos.x;
                var diff_y = f.pos.y - head.pos.y;

                if (diff_x == 0 && diff_y == 0) {
                    colliding_with = f;
                }

                if (f.pos.y == head.pos.y) {
                    if (diff_x <= 0 && (!nearest_L_obst 
                        || diff_x > (nearest_L_obst.pos.x - head.pos.x))) {
                        nearest_L_obst = f;
                    }

                    if (diff_x >= 0 && (!nearest_R_obst 
                        || diff_x < (nearest_R_obst.pos.x - head.pos.x))) {
                        nearest_R_obst = f;
                    }
                }

                if (f.pos.x == head.pos.x) {
                    if (diff_y <= 0 && (!nearest_U_obst 
                        || diff_y > (nearest_U_obst.pos.y - head.pos.y))) {
                        nearest_U_obst = f;
                    }

                    if (diff_y >= 0 && (!nearest_D_obst 
                        || diff_y < (nearest_D_obst.pos.y - head.pos.y))) {
                        nearest_D_obst = f;
                    }
                }
            }
        });

        var diff_L = (head.pos.x - nearest_L_obst.pos.x) /* / state.w*/ ;
        var diff_R = (nearest_R_obst.pos.x - head.pos.x) /* / state.w*/ ;
        var diff_U = (head.pos.y - nearest_U_obst.pos.y) /* / state.h*/ ;
        var diff_D = (nearest_D_obst.pos.y - head.pos.y) /* / state.h*/ ;
        // var diff_vec = [diff_L, diff_R, diff_U, diff_D];

        feats.push((diff_L == 1 ? 1 : 0));
        feats.push((diff_R == 1 ? 1 : 0));
        feats.push((diff_U == 1 ? 1 : 0));
        feats.push((diff_D == 1 ? 1 : 0));

        // feats.push(Math.sign(food.pos.x - head.pos.x));
        // feats.push(Math.sign(head.pos.x - food.pos.x));
        // feats.push(Math.sign(food.pos.y - head.pos.y));
        // feats.push(Math.sign(head.pos.y - food.pos.y));

        // // distance to nearest food
        // var feat_1 = 0;
        // if (food && head) {
        //     feat_1 = abs(food.pos.x - new_head_pos.x) + abs(food.pos.y - new_head_pos.y);
        // }
        // feats.push(feat_1);

        // // imminence of death by collision
        // var feat_2 = 0;
        // if (colliding_with && (colliding_with.isTag("SnakeBody") || colliding_with.isTag("Wall"))) {
        //     feat_2 = 1;
        // }
        // feats.push(feat_2);

        // var feat_food = 0;
        // if (food.pos.x == new_head_pos.x && food.pos.y == new_head_pos.y) {
        //     feat_food = 1;
        // }
        // feats.push(feat_food);

        // var feat_3 = (diff_L + diff_R + diff_U + diff_D) / 4;
        // feats.push(feat_3);

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
        return max(this.getQValues(state));
    }

    getAction(state, epsilon=0) {
        if (random(1) < epsilon) {
            return random(game.getLegalActions());
        }

        var possible_as = [ DirEnum.UP, DirEnum.RIGHT, DirEnum.DOWN, DirEnum.LEFT ];
        var possible_qs = this.getQValues(state);

        let best_q = max(possible_qs);

        let tied_as = [];
        for (var i = 0; i < possible_qs.length; i++) {
            if (possible_qs[i] == best_q) {
                tied_as.push(possible_as[i]);
            }
        }

        return random(tied_as);
    }

    getQValues(state) {
        var feats = this.extractFeatures(state);
        return this.perceptron.activate(feats);
    }

    observe(state, action, nextState, reward, episode_percent=0) {
        var squashedReward = undefined;
        if (reward < 0) {
            squashedReward = -1;
        } else if (reward == 0) {
            squashedReward = 0;
        } else {
            squashedReward = 1;
        }
        
        var stateQValues = this.getQValues(state);
        var actual = squashedReward + this.discount * this.getValue(nextState);
        
        var actualStateQValues = stateQValues.slice();
        actualStateQValues[this.actionToIdx(action)] = actual;
        
        var feats = this.extractFeatures(state);
        var learning_rate = (1 - episode_percent) * this.learning_rate;
        
        this.perceptron.activate(feats);
        this.perceptron.propagate(learning_rate, actualStateQValues);
    }
}