class Tree {
	constructor(root) {
		root.id = 0;
		this.nodes = [root];
	}

	get(id) {
		return this.nodes[id];
	}

	insert(node, parent) {
		node.id = this.nodes.length;
		this.nodes.push(node);
		this.nodes[parent.id].children.push(node.id);
	}

	update(node, new_data) {
		this.nodes[node.id].data = new_data;
	}

	getParent(node) {
		return this.nodes.find((f) => f.children.indexOf(node.id) != -1);
	}

	getChildren(node) {
		if (!node) return [];
		//todo
		return this.nodes.filter((f) => node.children.indexOf(f.id) != -1);
	}

	getSiblings(node) {
		return this.getChildren(this.getParent(node));
	}

	copy() {
		let arr = []
		for (var i = 0; i < this.nodes.length; i++) {
			arr.push(this.nodes[i].copy());
		}
		let new_tree = new Tree(arr[0]);
		new_tree.nodes = arr.slice();
		return new_tree;
	}
}

class Node {
	constructor (data, id=-1, children=[]) {
		this.data = data;
		this.id = id;
		this.children = children;
	}

	copy() {
		return new Node(this.data, this.id, this.children.slice());
	}

    isLeaf() {
        return this.children.length == 0;
    }

    isRoot() {
        return this.id == 0;
    }
}