function makeGameNode(model, value, visits, children) {
  return {
    "board": model,
    "value": value,
    "visits": visits,
    "children": children
  };
}

function setMCTS(tree, trace) {
  console.log(tree);
  console.log(trace);
}

// CONTROL

var next_iteration_flag = false;
var is_paused = true;

function clickRunMcts() {
}

function clickNext() {
}

function unpause() {
}

function clickPlay() {
}