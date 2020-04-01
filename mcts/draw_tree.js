//Heavily based on https://rachel53461.wordpress.com/2014/04/20/algorithm-for-drawing-trees/

var canvas;
var my_tree;

var node_size = {x: 50, y: 50};

function setup() {
    canvas = createCanvas(800, 600);
	textAlign(CENTER, CENTER);

    let root = new Node({name: "O_0"});
    my_tree = new Tree(root);
    my_tree.insert(new Node({name: "E_1"}), my_tree.get(0));
    my_tree.insert(new Node({name: "A_2"}), my_tree.get(1));
    my_tree.insert(new Node({name: "D_3"}), my_tree.get(1));
    my_tree.insert(new Node({name: "B_4"}), my_tree.get(3));
    my_tree.insert(new Node({name: "C_5"}), my_tree.get(3));
    my_tree.insert(new Node({name: "F_6"}), my_tree.get(0));
    my_tree.insert(new Node({name: "N_7"}), my_tree.get(2));
    my_tree.insert(new Node({name: "G_8"}), my_tree.get(7));
    my_tree.insert(new Node({name: "M_9"}), my_tree.get(7));
    my_tree.insert(new Node({name: "H_10"}), my_tree.get(9));
    my_tree.insert(new Node({name: "I_11"}), my_tree.get(9));
    my_tree.insert(new Node({name: "J_12"}), my_tree.get(9));
    my_tree.insert(new Node({name: "K_13"}), my_tree.get(9));
    my_tree.insert(new Node({name: "L_14"}), my_tree.get(9));

    prepareTree(my_tree);
}

function draw() {
	stroke(0);

	postorder_draw(my_tree, my_tree.get(0));
}

function prepareTree(tree) {
	tree.get(0).data.y = 0;

	//first traversal
	calculateInitialValues(tree, tree.get(0));
	checkAllChildrenOnScreen(tree, tree.get(0));
	calculateFinalValues(tree, tree.get(0), 0);
}

function calculateInitialValues(tree, node, sibling_idx = 0) {
	let parent = tree.getParent(node);
	let children = tree.getChildren(node);

	for (var i = 0; i < children.length; i++) {
		let child = children[i];

		child.data.y = node.data.y + 1;

		calculateInitialValues(tree, child, i);
	}

	node.data.final_x = 0;
	node.data.mod = 0;

	if (node.isLeaf()) {
		if (sibling_idx == 0) {
			node.data.x = 0;
		}
		else {
			node.data.x = sibling_idx;	
		}
	}
	else if (node.hasNChildren(1)) {
		if (sibling_idx == 0) {
			node.data.x = children[0].data.x;
		}
		else {
			node.data.x = tree.getSiblings(node)[sibling_idx - 1].data.x + sibling_idx;
			node.data.mod = node.data.x - children[0].data.x;
		}
	}
	else {
		let left_child = children[0];
		let right_child = children[children.length - 1];
		let mid = (left_child.data.x + right_child.data.x) / 2;

		if (sibling_idx == 0) {
			node.data.x = mid;
		} else {
			node.data.x = tree.getSiblings(node)[sibling_idx - 1].data.x + sibling_idx;
			node.data.mod = node.data.x - mid;
		}
	}

	fixConflicts(tree, node, sibling_idx);
}
	
function calculateFinalValues(tree, node, mod_sum) {
	node.data.final_x = node.data.x + mod_sum;

	let children = tree.getChildren(node);
	for (var i = 0; i < children.length; i++) {
		calculateFinalValues(tree, children[i], node.data.mod + mod_sum);
	}
}

function fixConflicts(tree, node, sibling_idx = 0) {
	let min_distance = 1;

	let children = tree.getChildren(node);
	let shift_value = 0;

	let node_contour = {};
	node_contour = getLeftContour(tree, node, 0, node_contour);

	let siblings = tree.getSiblings(node);

	for (var i = 0; i < sibling_idx; i++) {
		let sibling = siblings[i];
		
		let sibling_contour = {};
		sibling_contour = getRightContour(tree, sibling, 0, sibling_contour);

		for (var lvl = node.data.y; lvl <= min(max(Object.keys(sibling_contour), Object.keys(node_contour))); lvl++) {
			let distance = node_contour[lvl] - sibling_contour[lvl];
			if (distance + shift_value < min_distance) {
				shift_value = max(min_distance - distance, shift_value);
			}
		}

		if (shift_value > 0) {
			centerNodesBetween(tree, sibling, i, node, sibling_idx, siblings, shift_value);
		}
	}

	if (shift_value > 0) {
		node.data.x += shift_value;
		node.data.mod += shift_value;
		shift_value = 0;
	}
}

function centerNodesBetween(tree, left_node, left_node_idx, right_node, right_node_idx, siblings, shift_value) {
	let num_nodes_between = (right_node_idx - left_node_idx) - 1;

	if (num_nodes_between > 0) {
		let distance_between_nodes = (right_node.data.x + shift_value - left_node.data.x) / (num_nodes_between + 1);

		let count = 1;
		for (var i = left_node_idx + 1; i < right_node_idx; i++) {
			let middle_node = siblings[i];

			let desired_x = left_node.data.x + (distance_between_nodes * count);
			let offset = desired_x - middle_node.data.x;
			middle_node.data.x += offset;
			middle_node.data.mod += offset;

			count++;
		}
		
		fixConflicts(tree, left_node, left_node_idx);
	}
}

function checkAllChildrenOnScreen(tree, root) {
	let root_contours = getLeftContour(tree, root, 0, {});

	let shift_value = 0;
	let lvls = Object.keys(root_contours);
	for (var i = 0; i < lvls.length; i++) {
		if (root_contours[lvls[i]] + shift_value < 0) {
			shift_value += (root_contours[lvls[i]] * -1);
		}
	}

	if (shift_value > 0) {
		root.data.x += shift_value;
		root.data.mod += shift_value;
	}
}

function getLeftContour(tree, node, mod_sum, contours) {
	if (contours[node.data.y] == null) {
		contours[node.data.y] = node.data.x + mod_sum;
	} else {
		contours[node.data.y] = min(contours[node.data.y], node.data.x + mod_sum);
	}

	mod_sum += node.data.mod;

	let children = tree.getChildren(node);
	for (var i = 0; i < children.length; i++) {
		contours = getLeftContour(tree, children[i], mod_sum, contours);
	}

	return contours;
}

function getRightContour(tree, node, mod_sum, contours) {
	if (contours[node.data.y] == null) {
		contours[node.data.y] = node.data.x + mod_sum;
	} else {
		contours[node.data.y] = max(contours[node.data.y], node.data.x + mod_sum);
	}

	mod_sum += node.data.mod;

	let children = tree.getChildren(node);
	for (var i = 0; i < children.length; i++) {
		contours = getRightContour(tree, children[i], mod_sum, contours);
	}

	return contours;
}

function postorder_draw(tree, node) {
	let children = tree.getChildren(node);
	for (var i = 0; i < children.length; i++) {
		let child = children[i];
		postorder_draw(tree, child);
	}

	push();
	translate(
		node.data.final_x * 2 * node_size.x,
		node.data.y * 2 * node_size.y);
	rect(0, 0, node_size.x, node_size.y); 
	text(node.data.name, node_size.x / 2, node_size.y / 2);

	//drawing edges
	line(node_size.x / 2, 0, node_size.x / 2, - node_size.y/2);
	if (children.length > 0) {
		line(node_size.x / 2, node_size.y, node_size.x / 2, node_size.y * 1.5);
	}
	pop();

	//drawing edges
	if (children.length > 0) {
		line((children[0].data.final_x * 2 + 1/2) * node_size.x,
			 (2 * node.data.y + 3/2) * node_size.y,
			 (children[children.length - 1].data.final_x * 2+ 1/2) * node_size.x,
			 (2 * node.data.y + 3/2) * node_size.y);
	}
}