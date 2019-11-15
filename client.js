let width = 15, height = 15, size = 25, mines = 20, boxesCleared = 0;
let tBoxes = [], tBoxVecs = []; //tBoxVecs = [{x, y}, {status}, {flagged}, {cleared}];
let playing = false;
let smileyFace = document.getElementById("smileyFace");
let scoreboardId = document.getElementById("scoreboard");
scoreboardId.style = "width: " + width * size + "px; height: " + 1.5 * size + "px;";
let minesRemaining = document.getElementById("minesRemaining");
let scoreboardClass = document.querySelectorAll(".scoreboard");
scoreboardClass.forEach( x => {
  x.style = "width: " + (width * size) / 3 + "px; height: " + size * 1.5 + "px;";
});
let timer = document.getElementById("timer");
let grid = document.getElementById("grid");
grid.style = "width: " + width * size + "px; height: " + height * size + "px;";
let userGame = document.getElementById("userGame");
let howToPlay = document.getElementById("howToPlay");
let scores = document.getElementById("scores");

class Vec {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

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

function randomMines(mines, firstClick) {
  let i = 0;
  for (i; i < mines; i++) {
    let index = Math.floor(Math.random() * (width * height));
    if (tBoxVecs[index].status === "💣" || index == firstClick) {
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
      if (testBox === box) {
        continue;
      } else {
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
    x.addEventListener("mousedown", boxClick);
  });
}

function clearBoxes(x, y) {
  for (let y1 = Math.max(0, y - 1); y1 <= Math.min(height - 1, y + 1); y1++) {
    for (let x1 = Math.max(0, x - 1); x1 <= Math.min(width - 1, x + 1); x1++) {
      let testBox = tBoxVecs[tBoxesIndex(x1, y1)];
      if (testBox.status === "💣" || testBox.flagged) {
        continue;
      } else {
        testBox.cleared ? boxesCleared = boxesCleared : boxesCleared++;
        tBoxes[tBoxesIndex(x1, y1)].className = "box uncovered";
        tBoxes[tBoxesIndex(x1, y1)].textContent = testBox.status;
        testBox.cleared = true;
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

let boxesToClear = [];
function uncover(x, y, index) {
  if (typeof tBoxVecs[index].status === "number") {
    tBoxVecs[index].cleared ? boxesCleared = boxesCleared : boxesCleared++;
    tBoxes[index].className = "box uncovered"; 
    tBoxes[index].textContent = tBoxVecs[index].status;
    tBoxVecs[index].cleared = true;
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
    toCheckNext.forEach( ([x, y]) => uncover(x, y, tBoxesIndex(x, y)));
  } else {
    boxesToClear.forEach( ([x, y]) => clearBoxes(x, y));
  }
}

let start = null;
function startStopTimer(bool) {
  if (bool) {
    start = setInterval(function() {
      timer.textContent++;
      if (timer.textContent == 999) {
        gameOver();
      }
    }, 1000);
  } else {
    clearInterval(start);
  }
}

function gameOver() {
  console.log("Game Over"); 
  smileyFace.textContent = "🙁";
  playing = false;
  startStopTimer(false);
  tBoxVecs.forEach( (x, i) => {
    if (x.status === "💣" && !x.flagged) {
      tBoxes[i].className = "box uncovered"; 
      tBoxes[i].textContent = tBoxVecs[i].status;
    }
  });
}

function winGame() {
  console.log("You Win");
  smileyFace.textContent = "😎";
  playing = false;
  startStopTimer(false);
   // for future score display
  /* let score = document.createElement("p");
  console.log(`score: ${score}`);
  score.textContent = "Time: " + timer.textContent;
  console.log(`textContent: ${score.textContent}`);
  scores.appendChild(score);
  console.log("scores: " + scores); */
}

function boxClick(event) {
  if (smileyFace.textContent !== "😀") return;
  let index = event.srcElement.id;
  let x = tBoxVecs[index].x, y = tBoxVecs[index].y;
  let flagged = tBoxVecs[index].flagged;
  if (!playing) {
    randomMines(mines, index);
    bombsNearby();
    uncover(x, y, index);
    if (boxesCleared === (width * height) - mines) {
      winGame();
    }
    playing = true;
    startStopTimer(true);
  }
  if (event.button === 0 && !flagged) {
    if (tBoxVecs[index].status === "💣") {
      gameOver();
    } else {
      uncover(x, y, index); 
      if (boxesCleared === (width * height) - mines) {
        winGame();
      }
    }
  }
  if (event.button === 2) {
    if (flagged && tBoxes[index].className !== "box uncovered") {
      tBoxes[index].textContent = "";
      tBoxVecs[index].flagged = false;
      minesRemaining.textContent++;
    } else if (!flagged && tBoxes[index].className !== "box uncovered" && minesRemaining.textContent > 0) {
      tBoxes[index].textContent = "⚑";
      tBoxes[index].className = "box covered red";
      tBoxVecs[index].flagged = true;
      minesRemaining.textContent--;
    }
  }
  event.preventDefault();
}

function newGame() {
  if (grid.firstChild) {
    while (grid.firstChild) {
      grid.firstChild.remove();
    }
    tBoxes = [], tBoxVecs = [], boxesToClear = [], boxesCleared = 0;
  }
  createGrid();
  addMouseListener();
  smileyFace.textContent = "😀";
  timer.textContent = 0;
  minesRemaining.textContent = mines;
  playing = false;
}
newGame();

function reset() {
  if (smileyFace.textContent !== "😀") {
    newGame();
  }
}
smileyFace.addEventListener("click", reset);

function createUserGame() {
  clearInterval(start);
  //playing = false;
  width = parseInt(document.getElementById("selectGameWidth").value);
  height = parseInt(document.getElementById("selectGameHeight").value);
  mines = parseInt(document.getElementById("selectGameMines").value);
  grid.style = "width: " + width * size + "px; height: " + height * size + "px;";
  scoreboardId.style = "width: " + width * size + "px; height: " + 1.5 * size + "px;";
  scoreboardClass.forEach( x => {
    x.style = "width: " + (width * size) / 3 + "px; height: " + size * 1.5 + "px;";
  });
  newGame();
}

userGame.addEventListener("click", createUserGame);

function instructions() {
  let instructions = document.getElementById("instructions");
  if (instructions.style.display === "none") {
    instructions.style.display = "block";
    howToPlay.textContent = "Hide Instructions";
  } else {
    instructions.style.display = "none";
    howToPlay.textContent = "Show Instructions";
  }
}

howToPlay.addEventListener("click", instructions);

// add click counter?, click open square to clear all correctly flgged squares?
//double right click to put question mark?