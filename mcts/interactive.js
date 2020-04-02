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
let best_move = null;

let currentActionIdx = -1;

function setupInteractive() {
  document.getElementById("btn_next").addEventListener("click", clickNext);
  document.getElementById("btn_finish").addEventListener("click", clickFinish);
  document.getElementById("btn_make_play").addEventListener("click", clickMakePlay);
}

function setMCTS(mcts_obj, trace) {
  currentActionIdx = -1;

  final_tree = mcts_obj.tree.copy();
  draw_tree = new Tree(new Node(new GameNode(null)));
  initial_board = mcts_obj.model.copy();
  action_trace = trace.trace;
  best_move = trace.move;

  tree_vis_p5.initial_board = initial_board;

  clickNext();
}

function applyAction(action) {
  draw_tree.nodes.forEach((f) => { 
    f.data.backpropagated = false;
    f.data.simulated = false;
    f.data.selected = false;
    f.data.expanded = false
  });

  switch (action.kind) {
    case "selection":
      draw_tree.nodes.forEach((f) => {
        if (f.data.simulated_board) {
          draw_tree.remove(f);
        }
      })
      draw_tree.get(action.node_id).data.selected = true;
      break;
    case "expansion":
      let parent = draw_tree.get(final_tree.getParent(final_tree.get(action.node_id)).id);
      draw_tree.insert(new Node(new GameNode(final_tree.get(action.node_id).data.move)), parent);
      draw_tree.get(action.node_id).data.expanded = true;
      draw_tree.get(action.node_id).data.collapsed = false;
      break;
    case "simulation":
      let simulated_node = new Node(new GameNode(draw_tree.get(action.node_id).data.move.copy()));
      simulated_node.data.simulated_board = action.new_data.board;
      simulated_node.data.simulated = true;
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

function sendUpdateDrawTree(tree) {
  let action_kind = "---";
  let progress_bar = "(0/0)";

  if (action_trace.length > 0 && currentActionIdx >= -1 && currentActionIdx < action_trace.length) {
    action_kind = action_trace[currentActionIdx].kind;
    progress_bar = "(" + currentActionIdx + "/" + (action_trace.length - 1) + ")";
  }

  document.getElementById("current_action_kind").innerHTML = action_kind;
  document.getElementById("current_action_kind").className = action_kind;
  document.getElementById("current_action_count").innerHTML = progress_bar;
  tree_vis_p5.updateTree(tree);
}

// CONTROL

function clickNext() {
  currentActionIdx += 1;
  applyAction(action_trace[currentActionIdx]);
  let tree = prepareTree(draw_tree.copy(), {min_distance: 1});
  sendUpdateDrawTree(tree);
}

function clickFinish() {
  currentActionIdx = action_trace.length - 1;
  draw_tree = final_tree.copy();
  let tree = prepareTree(draw_tree.copy(), {min_distance: 1});
  tree.nodes.forEach((f) => { if (!f.isRoot()) f.data.collapsed = true });
  sendUpdateDrawTree(tree);

  tree_vis_p5.focusNode(tree_vis_p5.tree.getRoot());
}

function clickMakePlay() {
  myp5.makeMove(best_move);
  currentActionIdx = -1;
  action_trace = [];
  sendUpdateDrawTree(null);
}