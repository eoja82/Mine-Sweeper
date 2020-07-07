// preset game grids
let gameLevels = document.getElementById("gameLevels");
let gameLevel = gameLevels.selectedOptions[0].value;
gameLevels.addEventListener("change", setGameLevel);

let customGameLevels = document.getElementById("customGameLevels");

let width, height, 
    size = 25, mines, 
    boxesCleared = 0,
    playing = false;

/* beginner: 9x9 10 mines
   intermediate: 16x16 40 mines
   expert: 16x30 99 mines */

switch (gameLevel) {
  case "beginner": width = 9, height = 9, mines = 5;
    break;
  case "intermediate": width = 16, height = 16, mines = 10;
    break;
  case "expert": width = 30, height = 16, mines = 99;
   break;
  case "custom": width = parseInt(document.getElementById("selectGameWidth").value),
  height = parseInt(document.getElementById("selectGameHeight").value),
  mines = parseInt(document.getElementById("selectGameMines").value),
  customGameLevels.style.display = "block"
  default:
    break;
}

const numberColor = {
  1: "blue", 2: "green", 3: "red", 4: "purple", 5: "maroon",
  6: "turquoise", 7: "black", 8: "gray"
};

// tBoxVecs will = [{x, y}, {status}, {flagged}, {cleared}];
let tBoxes = [], tBoxVecs = []; 

let smileyFace = document.getElementById("smileyFace");
smileyFace.addEventListener("click", reset);

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

// custom game grid
let userGame = document.getElementById("userGame");
userGame.addEventListener("click", createUserGame);

let howToPlay = document.getElementById("howToPlay");
let closeInstructions = document.getElementById("closeInstructions")
howToPlay.addEventListener("click", instructions);
closeInstructions.addEventListener("click", instructions);

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

// create grid as table
function createGrid() {
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
      tBoxVecs.push( {x, y} );
    }
    grid.appendChild(tRow);
  }
}

function addMouseListener() {
  tBoxes.forEach( x => {
    x.addEventListener("mousedown", boxClick);
  });
}

function boxClick(event) {
  if (smileyFace.textContent !== "😀") return;
  let index = event.srcElement.id,
      x = tBoxVecs[index].x, 
      y = tBoxVecs[index].y,
      flagged = tBoxVecs[index].flagged;
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
    if (flagged && tBoxes[index].classList.contains("covered")) {
      tBoxes[index].textContent = "";
      tBoxes[index].classList.remove("redFlag");
      tBoxVecs[index].flagged = false;
      minesRemaining.textContent++;
    } else if (!flagged && tBoxes[index].classList.contains("covered") && minesRemaining.textContent > 0) {
      tBoxes[index].textContent = "⚑";
      tBoxes[index].classList.add("redFlag");
      tBoxVecs[index].flagged = true;
      minesRemaining.textContent--;
    }
  }
  event.preventDefault();
}

// randomly place mines on grid, but not on first box clicked
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

let boxesToClear = [];
function uncover(x, y, index) {
  if (typeof tBoxVecs[index].status === "number") {
    update_tBox(index);
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

function clearBoxes(x, y) {
  for (let y1 = Math.max(0, y - 1); y1 <= Math.min(height - 1, y + 1); y1++) {
    for (let x1 = Math.max(0, x - 1); x1 <= Math.min(width - 1, x + 1); x1++) {
      let testBox = tBoxVecs[tBoxesIndex(x1, y1)];
      if (testBox.status === "💣" || testBox.flagged) {
        continue;
      } else {
        update_tBox(tBoxesIndex(x1, y1));
      }
    }
  }
}

function update_tBox(index) {
  tBoxVecs[index].cleared ? boxesCleared = boxesCleared : boxesCleared++;
  tBoxes[index].classList.replace("covered", "uncovered"); 
  tBoxes[index].textContent = tBoxVecs[index].status;
  tBoxes[index].classList.add(numberColor[tBoxVecs[index].status]);
  tBoxVecs[index].cleared = true;
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
  smileyFace.textContent = "🙁";
  playing = false;
  startStopTimer(false);
  tBoxVecs.forEach( (x, i) => {
    if (x.status === "💣" && !x.flagged) {
      tBoxes[i].classList.replace("covered", "uncovered"); 
      tBoxes[i].textContent = tBoxVecs[i].status;
    }
  });
}

function winGame() {
  smileyFace.textContent = "😎";
  playing = false;
  startStopTimer(false);
  //console.log(gameLevel);
  //console.log("logged in: " + loggedIn + " user: " + user);
  let score = timer.innerText
  //console.log(`score: ${score} ${typeof score}`)
  if (loggedIn && gameLevel !== "custom") {
    //console.log("getScores")
    getScores(score)
  }
}

function getScores(score) {
  //console.log("in GetScores")
  const xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function() {
    //console.log(`ready: ${this.readyState}, status: ${this.status}`)
    if (this.readyState == 4 && this.status >= 400) {
      alert(this.response);
      console.log("error saving score");
    } 
    if (this.readyState == 4 && this.status == 200) {
      const res = JSON.parse(this.response)
      console.log(res)
      alert(res.message)
      setLeaderboardScores(res, res.loggedIn)
    }
  }
  xhttp.open("PUT", "/scores", true)
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(`username=${user}&level=${gameLevel}&score=${score}`)
}

function reset() {
  if (smileyFace.textContent !== "😀") {
    newGame();
  }
}

// sets preset game level
function setGameLevel(e) {
  clearInterval(start);
  switch (e.target.selectedOptions[0].value) {
    case "beginner": width = 9, height = 9, mines = 5, gameLevel = "beginner", customGameLevels.style.display = "none";
      break;
    case "intermediate": width = 16, height = 16, mines = 10, gameLevel = "intermediate", customGameLevels.style.display = "none";
      break;
    case "expert": width = 30, height = 16, mines = 99, gameLevel = "expert", customGameLevels.style.display = "none";
      break;
    case "custom": gameLevel = "custom", toggleCustomGameLevels();
      break;
    default:
      break;
  }
  grid.style = "width: " + width * size + "px; height: " + height * size + "px;";
  scoreboardId.style = "width: " + width * size + "px; height: " + 1.5 * size + "px;";
  scoreboardClass.forEach( x => {
    x.style = "width: " + (width * size) / 3 + "px; height: " + size * 1.5 + "px;";
  });
  newGame();
}

function toggleCustomGameLevels() {
  if (customGameLevels.style.display == "none") {
    customGameLevels.style.display = "block"
    customGameLevels.scrollIntoView(true)
  } else {
    customGameLevels.style.display = "none"
  }
}

// creates custom game level
function createUserGame() {
  clearInterval(start);
  width = parseInt(document.getElementById("selectGameWidth").value);
  height = parseInt(document.getElementById("selectGameHeight").value);
  mines = parseInt(document.getElementById("selectGameMines").value);
  grid.style = "width: " + width * size + "px; height: " + height * size + "px;";
  scoreboardId.style = "width: " + width * size + "px; height: " + 1.5 * size + "px;";
  scoreboardClass.forEach( x => {
    x.style = "width: " + (width * size) / 3 + "px; height: " + size * 1.5 + "px;";
  });
  //gameLevel = null
  newGame();
}

// show/hide instructions
function instructions() {
  const instructions = document.getElementById("instructions");
  if (instructions.style.display === "none") {
    instructions.style.display = "block";
    howToPlay.firstElementChild.innerHTML = "Hide Instructions<hr>";
  } else {
    instructions.style.display = "none";
    howToPlay.firstElementChild.innerHTML = "Show Instructions<hr>";
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