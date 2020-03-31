function makeGameNode(model, value, visits, children) {
  return {
    "board": model,
    "value": value,
    "visits": visits,
    "children": children
  };
}

let final_tree = undefined;
let draw_tree = undefined;
let initial_board = undefined;
let action_trace = [];

let currentActionIdx = 0;

function setMCTS(mcts_obj, trace) {
  final_tree = mcts_obj.tree.copy();
  draw_tree = new Tree(new Node(new GameNode(null)));
  initial_board = mcts_obj.model.copy();
  action_trace = trace.trace;

  tree_vis_p5.initial_board = initial_board;
  sendUpdateDrawTree();

  // console.log(tree);
  // console.log(trace);
}

function applyAction(action) {
  // draw_tree.nodes = draw_tree.nodes.forEach((f) => f.data.backpropagated = false);
  draw_tree.nodes.forEach((f) => { f.data.backpropagated = false });
  draw_tree.nodes.forEach((f) => { f.data.selected = false });
  draw_tree.nodes = draw_tree.nodes.filter((f) => !f.simulated_board);

  switch (action.kind) {
    case "selection":
      draw_tree.get(action.node_id).data.selected = true;
      break;
    case "expansion":
      let parent = draw_tree.get(final_tree.getParent(final_tree.get(action.node_id)).id);
      draw_tree.insert(new Node(new GameNode(final_tree.get(action.node_id).data.move)), parent);
      break;
    case "simulation":
      let simulated_node = new Node(new GameNode(draw_tree.get(action.node_id).data.move.copy()));
      simulated_node.simulated_board = action.new_data.board;
      draw_tree.insert(simulated_node, draw_tree.get(action.node_id));
      break;
    case "backpropagation":
      let my_parent = draw_tree.get(action.node_id);
      while (!my_parent.isRoot()) {
        my_parent.data.backpropagated = true;
        my_parent.data.value = action.new_data.new_value;
        my_parent.data.simulations = action.new_data.new_visits;
        my_parent = draw_tree.getParent(my_parent);
      }
      break;
  }
}

function sendUpdateDrawTree() {
  tree_vis_p5.tree = draw_tree;
}

// CONTROL

function clickRunMcts() {
}

function clickNext() {
  currentActionIdx += 1;
  applyAction(action_trace[currentActionIdx]);
  sendUpdateDrawTree();
}

function unpause() {
}

function clickPlay() {
}