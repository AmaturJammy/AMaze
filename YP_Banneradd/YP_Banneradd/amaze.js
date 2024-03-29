//a few globals
var dimensions = 15;
var pixels;
var cells;
var start;
var end;
var path;

function round(value) { return (value + 0.5) | 0; }


//temp testing aftermaze (win)
function tempwin() {
  window.location.href = "redirect.html";
}


  //redirect to YellowPages
function redirect() {
  window.open("https://www.yellowpages-curacao.com/", 'newwindow');
}

//show the maze
var draw = function () {
  var canvas = document.getElementById('maze');
  var context = canvas.getContext('2d');
  canvas.width  = 240;
  canvas.height = 240;

  //fill
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);

  //draw the maze
  pixels = Math.min(canvas.width, canvas.height); 
  var scale = pixels / dimensions;
  var line = function(x1, y1, x2, y2) { context.moveTo(x1 + .5, y1 + .5); context.lineTo(x2 + .5, y2 + .5); };
  context.scale(scale,scale);
  context.strokeStyle = 'white';
  context.lineCap = 'square';
  context.lineJoin = 'miter';
  context.lineWidth = .75;
  cells.forEach(function(column, x) {
    column.forEach(function(row, y) {
      context.beginPath();
      if(row & 1) line(x, y, x - 1, y);
      if(row & 2) line(x, y, x + 1, y);
      if(row & 4) line(x, y, x, y - 1);
      if(row & 8) line(x, y, x, y + 1);
      context.stroke();
      context.closePath;
    });
  });

  //draw the destination
  context.fillStyle = '#44bb77';
  context.strokeStyle = '#006600';
  context.lineJoin = 'miter';
  context.lineWidth = .05;
  (function starPath(x, y, n, or, ir) {
    var rot = -Math.PI / 2;
    var step = Math.PI / n;
    context.beginPath();
    context.moveTo(x, y - or)
    for (i = 0; i < n; i++) {
      context.lineTo(x + Math.cos(rot) * or, y + Math.sin(rot) * or);
      rot += step
      context.lineTo(x + Math.cos(rot) * ir, y + Math.sin(rot) * ir);
      rot += step
    }
    context.lineTo(x, y - or)
    context.closePath();  
  })(end[0] + .5, end[1] + .5, 5, .33, .16);
  context.stroke();
  context.fill();

  //draw the path
  if(path.length) {
    context.strokeStyle = '#ffdddd';
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = .2;
    context.beginPath();
    context.moveTo(path[0][0] + .5, path[0][1] + .5);
    path.forEach(function (pt) {
      context.lineTo(pt[0] + .5, pt[1] + .5);
    });
    context.lineTo(start[0] + .5, start[1] + .5);
    context.stroke();
    context.closePath();
  }

  //draw the current position
  context.fillStyle = '#6699cc';
  context.strokeStyle = '#003399';
  context.lineJoin = 'miter';
  context.lineWidth = .05;
  context.beginPath();
  context.arc(start[0] + .5, start[1] + .5, .25, 0, 2 * Math.PI);
  context.closePath();
  context.stroke();
  context.fill();

  //did you win
  if(start[0] == end[0] && start[1] == end[1]) {
    window.location.href = "redirect.html";
  } 
};

  //play again
  function playagain() {
    window.location.href = "index.html";
  }
//initialize a new maze
var reset = function () {
  //clear the maze
  cells = [];
  for(var x = 0; x < dimensions; x++) {
    cells.push([]);
    for(var y = 0; y < dimensions; y++)
      cells[x].push(0);
  }

  //get the shared walls between a cell and its neighbors
  var getWalls = function(x, y) {
    var walls = [];
    [[x - 1, y, 1], [x + 1, y, 2], [x, y - 1, 4], [x, y + 1, 8] ].forEach(function (n){
      if(n[0] > -1 && n[0] < dimensions && n[1] > -1 && n[1] < dimensions && cells[n[0]][n[1]] == 0)
        walls.push([[x, y], n]);
    });
    return walls;
  };

  //generate the maze starting at a random set of walls
  var walls = getWalls(round(Math.random() * (dimensions - 1)), round(Math.random() * (dimensions - 1)));
  while(walls.length) {
    //randomly pick a wall
    var index = (Math.random() * walls.length) | 0;
    var from = walls[index][0];
    var to = walls[index][1];
    walls.splice(index, 1);
    //connect it if its still needing connected
    if(cells[to[0]][to[1]] == 0) {
      cells[from[0]][from[1]] |= to[2];
      cells[to[0]][to[1]] |= (to[2] + 1) % 3 == 0 ? to[2] >> 1 : to[2] << 1;
      //add its relevant neighbors
      walls = walls.concat(getWalls(to[0], to[1]));
    }
  }

  //randomly start along the perimeter of the maze and end on the opposite side
  if(round(Math.random())) {
    start = [round(Math.random()) * (dimensions - 1), round(Math.random() * (dimensions - 1))];
    end = [start[0] ? 0 : dimensions - 1, round(Math.random() * (dimensions - 1))];
  }
  else {
    start = [round(Math.random() * (dimensions - 1)), round(Math.random()) * (dimensions - 1)];
    end = [round(Math.random() * (dimensions - 1)), start[1] ? 0 : dimensions - 1];
  }
  path = [];

  //(function depth_first_backtrack(x, y){
  //})(0,0);
      
  //show it
  draw();
};

//show the solution to the maze
var solve = function () {
  //TODO: A*
};

//movement in general
var keyToNeighbor = { '-1': {'0': 1}, '1': {'0': 2}, '0': {'-1': 4, '1': 8} };
function move(x, y) {
  //figure out which neighbor
  var neighbor = 0;
  try { neighbor = keyToNeighbor[x - start[0]][y -  start[1]]; } catch (e) { }
  var mask = cells[start[0]][start[1]];
  //is it a valid move
  if(mask & neighbor) {
    if(path.length && x == path[path.length - 1][0] && y == path[path.length - 1][1])
      path.pop();
    else
      path.push(start);
    start = [x, y];
    draw();
  }
}

//move around the maze with arrow keys
var onKeyPress = function(e) {
  if(e.keyCode > 36 && e.keyCode < 41)
    move(start[0] + ((e.keyCode - 38) % 2), start[1] + ((e.keyCode - 39) % 2));
};

//move around the maze with finger or mouse
var onHover = function(e) {
  //touch
  if(e.changedTouches !== undefined) {
    for(var i = 0; i < e.changedTouches.length; i++)
      move((e.changedTouches[i].pageX / pixels * dimensions) | 0, (e.changedTouches[i].pageY / pixels * dimensions) | 0);
  }//mouse
  else if(e.clientX !== undefined){
    console.log(e);
    move((e.clientX / pixels * dimensions) | 0, ((e.clientY -80) / pixels * dimensions) | 0);

  }
}

//capture interaction
var canvas = document.getElementById('maze');
canvas.addEventListener('keypress', onKeyPress);
canvas.addEventListener("touchstart", onHover, false);
canvas.addEventListener("touchmove", onHover, false);
canvas.addEventListener("mousemove", onHover, false);

//capture screen updates
window.onload = reset;
window.onresize = draw;
