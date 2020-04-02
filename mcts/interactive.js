function makeGameNode(model, value, visits, children) {
  return {
    "board": model,
    "value": value,
    "visits": visits,
    "children": children
  };
}

let initial_board = undefined;
let action_trace = [];
let best_move = null;
let currentActionIdx = -1;

let final_tree = undefined;
let reconstructed_tree = undefined;
let draw_tree = undefined;

function setupInteractive() {
  document.getElementById("btn_next").addEventListener("click", clickNext);
  document.getElementById("btn_finish").addEventListener("click", clickFinish);
  document.getElementById("btn_make_play").addEventListener("click", clickMakePlay);
}

function setMCTS(mcts_obj, trace) {
  currentActionIdx = -1;

  initial_board = mcts_obj.model.copy();
  action_trace = trace.trace;
  best_move = trace.move;

  final_tree = mcts_obj.tree.copy();
  reconstructed_tree = new Tree(new Node(new GameNode(null)));
  draw_tree = makeDrawTree(reconstructed_tree);

  tree_vis_p5.initial_board = initial_board;

  document.getElementById("btn_next").disabled = false;
  document.getElementById("btn_finish").disabled = false;
  document.getElementById("btn_make_play").disabled = false;

  clickNext();
}

function sendDrawTree(tree) {
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

function toggleCollapse(node) {
  let reconstructed_node = reconstructed_tree.nodes.find((f) => f.data.action_id == node.data.action_id);
  reconstructed_node.data.collapsed = !reconstructed_node.data.collapsed;
  
  draw_tree = makeDrawTree(reconstructed_tree);
  sendDrawTree(draw_tree);

  tree_vis_p5.focusNode(node, true);
}

function makeDrawTree(tree) {
  let d_tree = tree.copy();

  d_tree.nodes.forEach((f) => { if (!f.isLeaf()) f.data.should_show_collapse_btn = true; })

  while (true) {
    for (var i = 0; i < d_tree.nodes.length; i++) {
      let parent = d_tree.getParent(d_tree.get(i));
      if (parent && parent.data.collapsed) {
        d_tree.remove(d_tree.get(i));
        i = 0;
      }
    }
    break;
  }

  return prepareTree(d_tree, {min_distance: 1});
}

function applyAction(action) {
  reconstructed_tree.nodes.forEach((f) => { 
    f.data.backpropagated = false;
    f.data.simulated = false;
    f.data.selected = false;
    f.data.expanded = false
  });

  switch (action.kind) {
    case "selection":
      reconstructed_tree.nodes.forEach((f) => {
        if (f.data.simulated_board) {
          reconstructed_tree.getParent(f).data.should_show_collapse_btn = false;
          reconstructed_tree.remove(f);
        }
      })
      reconstructed_tree.get(action.node_id).data.selected = true;
      break;
    case "expansion":
      let parent = reconstructed_tree.get(final_tree.getParent(final_tree.get(action.node_id)).id);
      reconstructed_tree.insert(new Node(new GameNode(final_tree.get(action.node_id).data.move)), parent);
      reconstructed_tree.get(action.node_id).data.action_id = currentActionIdx;
      reconstructed_tree.get(action.node_id).data.expanded = true;
      reconstructed_tree.get(action.node_id).data.collapsed = false;
      break;
    case "simulation":
      let simulated_node = new Node(new GameNode(reconstructed_tree.get(action.node_id).data.move.copy()));
      simulated_node.data.simulated_board = action.new_data.board;
      simulated_node.data.simulated = true;
      reconstructed_tree.insert(simulated_node, reconstructed_tree.get(action.node_id));
      break;
    case "backpropagation":
      let my_parent = reconstructed_tree.get(action.node_id);
      while (!my_parent.isRoot()) {
        my_parent.data.backpropagated = true;
        my_parent.data.value = action.new_data.new_value;
        my_parent.data.simulations = action.new_data.new_visits;
        my_parent = reconstructed_tree.getParent(my_parent);
      }
      break;
  }
}

// CONTROL

function clickNext() {
  document.getElementById("btn_next").disabled = (currentActionIdx > action_trace.length - 1);

  if (currentActionIdx >= action_trace.length) return;

  currentActionIdx += 1;
  applyAction(action_trace[currentActionIdx]);

  draw_tree = makeDrawTree(reconstructed_tree);
  sendDrawTree(draw_tree);
}

function clickFinish() {
  for (currentActionIdx + 1; currentActionIdx < action_trace.length - 1; currentActionIdx++) {
    applyAction(action_trace[currentActionIdx]);
  }

  document.getElementById("btn_next").disabled = (currentActionIdx > action_trace.length - 2);
  document.getElementById("btn_finish").disabled = true;

  draw_tree = makeDrawTree(reconstructed_tree);

  draw_tree.getChildren(draw_tree.getRoot()).forEach((node) => {
    let reconstructed_node = reconstructed_tree.nodes.find((f) => f.data.action_id == node.data.action_id);
    reconstructed_node.data.collapsed = !reconstructed_node.data.collapsed;
  });

  draw_tree = makeDrawTree(reconstructed_tree);
  sendDrawTree(draw_tree);

  tree_vis_p5.focusNode(tree_vis_p5.tree.getRoot());
}

function clickMakePlay() {
  myp5.makeMove(best_move);
  currentActionIdx = -1;
  action_trace = [];
  sendDrawTree(null);

  document.getElementById("btn_make_play").disabled = true;
  document.getElementById("btn_next").disabled = true;
  document.getElementById("btn_finish").disabled = true;
}