let width = 15, height = 15, size = 25, mines = 20;
let tBoxes = [], tBoxVecs = [];
let playing = false;

class Vec {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    //this.status = status;
  }
}
let smileyFace = document.getElementById("smileyFace");

let scoreboardId = document.getElementById("scoreboard");
scoreboardId.style = "width: " + width * size + "px; height: " + 1.5 * size + "px;";

let minesRemaining = document.getElementById("minesRemaining");

let scoreboardClass = document.getElementsByClassName("scoreboard");
scoreboardClass.style = "width: " + (width * size) / 3 + "px; height: " + size * 1.5 + "px;";

let timer = document.getElementById("timer");

let grid = document.getElementById("grid");
grid.style = "width: " + width * size + "px; height: " + height * size + "px;";

// lookup index number
function tBoxesIndex(x1, y1) {
  let index; 
  tBoxVecs.forEach( (z, i) => {
    if (z.x === x1 && z.y === y1) index = i;
  });
  return index;
}

// function to find subarray in array
function findArray(arr, [x1, y1]) {
  let index = -1;
  arr.forEach( ([x, y], i) => {
    //console.log(`x: ${x}: x1: ${x1}, y: ${y}: y1 ${y1}`);
    if (x === x1 && y === y1) index = i;
  });
  return index;
}

function createGrid() {
  // create grid as table
  for (let y = 0; y < height; y++) {
    let tRow = document.createElement("tr");
    tRow.className = "row";
    tRow.style = "width: " + width * size + "px; height: " + size + "px; display: block;";
    for (let x = 0; x < width; x++) {
    let tBox = document.createElement("td");
      tBox.textContent = "";
      tBox.id = x + (y * width);
      tBox.className = "box covered";
      tBox.style = "width: " + size + "px;  height: " + size + "px;";
      tRow.appendChild(tBox);
      tBoxes.push(tBox);
      tBoxVecs.push(new Vec(x, y));
    }
    grid.appendChild(tRow);
  }
}

function randomMines(mines) {
  let i = 0;
  for (i; i < mines; i++) {
    let index = Math.floor(Math.random() * (width * height));
    if (tBoxVecs[index].status === "💣") {
      i--;
      continue;
    } else {
      tBoxVecs[index].status = "💣";
    }
  }
}

function findBombs(x, y, i) {
  let bombs = 0
  let box = tBoxVecs[i];
  for (let y1 = Math.max(0, y - 1); y1 <= Math.min(height - 1, y + 1); y1++) {
    for (let x1 = Math.max(0, x - 1); x1 <= Math.min(width - 1, x + 1); x1++) {
      let testBox = tBoxVecs[tBoxesIndex(x1, y1)];
      //console.log(`testBox: ${testBox.x}, ${testBox.y}, box: ${box.x} ${box.y}`)
      if (testBox === box) {
        continue;
      } else {
        //console.log(`testBox.status === ${testBox.status === "💣"}`)
        if (testBox.status === "💣") {
          bombs++;
        }
      }
    }
  }
  return bombs;
}
// set status of each tBoxes to number of bombs nearby
function bombsNearby() {
  tBoxVecs.map( ({x, y, status}, i) => {
    if (status === "💣") {
      tBoxVecs[i].status = status;
    } else {
      let bombs = findBombs(x, y, i);
      bombs === 0 ? tBoxVecs[i].status = "" : tBoxVecs[i].status = bombs;
    }
  });
}

function addMouseListener() {
  tBoxes.forEach( x => {
    //console.log("addEventListener");
    x.addEventListener("mousedown", boxClick);
  });
}

function clearBoxes(x, y) {
  for (let y1 = Math.max(0, y - 1); y1 <= Math.min(height - 1, y + 1); y1++) {
    for (let x1 = Math.max(0, x - 1); x1 <= Math.min(width - 1, x + 1); x1++) {
      let testBox = tBoxVecs[tBoxesIndex(x1, y1)];
      //console.log("testBox.status " + testBox.status);
      if (testBox.status === "💣" || testBox.flagged) {
        //console.log("continue " + x1 + ": " + y1);
        continue;
      } else {
        tBoxes[tBoxesIndex(x1, y1)].className = "box uncovered";
        tBoxes[tBoxesIndex(x1, y1)].textContent = testBox.status;
      }
    }
  }
}

function findEmpties(x, y) {
  let empties = [];
  for (let y1 = Math.max(0, y - 1); y1 <= Math.min(height - 1, y + 1); y1++) {
    for (let x1 = Math.max(0, x - 1); x1 <= Math.min(width - 1, x + 1); x1++) {
      let testBox = tBoxVecs[tBoxesIndex(x1, y1)];
      let emptyBox = tBoxVecs[tBoxesIndex(x, y)];
      if (testBox.status === "" && testBox !== emptyBox) {
        if (empties.indexOf([x1, y1]) < 0) {
          empties.push([x1, y1]);
        }
      }
      if (testBox === emptyBox) {
        clearBoxes(x1, y1);
      }
    }
  }
  return empties;
}

// this can be refractored maybe
let boxesToClear = [];
function uncover(x, y, index) {
  if (typeof tBoxVecs[index].status === "number") {
    //console.log(`at typeof is number`);
    tBoxes[index].className = "box uncovered"; 
    tBoxes[index].textContent = tBoxVecs[index].status;
    return;
  }
  let startSlice = boxesToClear.length;
  let added = 0;
  let empties = findEmpties(x, y);
  if (empties.length > 0) {
    empties.forEach( x => {
      if (findArray(boxesToClear, x) < 0) {
        boxesToClear.push(x);
        added++;
      }
    });
    let toCheckNext = boxesToClear.slice(startSlice, added + startSlice);
    //console.log(`boxesToClear: ${boxesToClear}, toCheckNext: ${toCheckNext}`);
    toCheckNext.forEach( ([x, y]) => uncover(x, y, tBoxesIndex(x, y)));
  } else {
    //console.log(`boxesToClear: ${boxesToClear}`);
    boxesToClear.forEach( ([x, y]) => clearBoxes(x, y));
  }
}

let start = null;
function startStopTimer(value) {
  if (value) {
    start = setInterval(function() {
      timer.value++;
    }, 1000);
  } else {
    clearInterval(start);
  }
}

function boxClick(event) {
  if (!playing) {
    playing = true;
    startStopTimer(true);
  }
  //console.log(event);
  let index = event.srcElement.id;
  let x = tBoxVecs[index].x, y = tBoxVecs[index].y;
  let flagged = tBoxVecs[index].flagged;

  if (event.button === 0 && !flagged) {
    if (tBoxVecs[index].status === "💣") {
      console.log("Game Over"); 
      smileyFace.value = "🙁";
      playing = false;
      startStopTimer(false);
      tBoxVecs.forEach( (x, i) => {
        if (x.status === "💣" && !x.flagged) {
          tBoxes[i].className = "box uncovered"; 
          tBoxes[i].textContent = tBoxVecs[i].status;
        }
      });
    } else {
      uncover(x, y, index); 
    }
  }
  if (event.button === 2) {
    if (flagged && tBoxes[index].className !== "box uncovered") {
      tBoxes[index].textContent = "";
      tBoxVecs[index].flagged = false;
      minesRemaining.value++;
    } else if (!flagged && tBoxes[index].className !== "box uncovered" && minesRemaining.value > 0) {
      tBoxes[index].textContent = "⚑";
      tBoxes[index].className = "box covered red";
      tBoxVecs[index].flagged = true;
      minesRemaining.value--;
    }
  }
  event.preventDefault();
}

function newGame() {
  if (grid.firstChild) {
    while (grid.firstChild) {
      grid.firstChild.remove();
    }
    tBoxes = [], tBoxVecs = [];
    minesRemaining.value = mines;
    //console.log("timer.value: " + timer.value);
  }
  createGrid();
  randomMines(mines);
  bombsNearby();
  addMouseListener();
  smileyFace.value = "😀";
  timer.value = 0;
  playing = false;
}
newGame();

function reset() {
  
  newGame();
}
smileyFace.addEventListener("click", reset);
