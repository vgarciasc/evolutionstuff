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
		node.parent_id = parent.id;
		this.nodes.push(node);
		this.nodes[node.parent_id].children_id.push(node.id);
	}

	update(node, new_data) {
		this.nodes[node.id].data = new_data;
	}

	getParent(node) {
		return this.nodes[node.parent_id];
	}

	getChildren(node) {
		if (!node) return [];
		let arr = [];
		for (var i = 0; i < node.children_id.length; i++) {
			arr.push(this.nodes[node.children_id[i]]);
		}
		return arr;
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
	constructor (data, id=-1, children_id=[], parent_id=-1) {
		this.data = data;
		this.id = id;
		this.children_id = children_id;
		this.parent_id = parent_id;
	}

	copy() {
		return new Node(this.data, this.id, this.children_id.slice(), this.parent_id);
	}

    hasNChildren(n) {
    	return this.children_id.length == n;
    }

    isLeaf() {
        return this.hasNChildren(0);
    }

    isRoot() {
        return this.id == 0;
    }
}