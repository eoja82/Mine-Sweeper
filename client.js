let width = 20, height = 20, size = 25, mines = 15;
let tBoxes = [], tBoxVecs = [];

class Vec {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    //this.status = status;
  }
}

let grid = document.getElementById("grid");
grid.style = "width: " + width * size + "px; height: " + height * size + "px;";

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

function tBoxesIndex(x1, y1) {
  let index; 
  tBoxVecs.forEach( (z, i) => {
    if (z.x === x1 && z.y === y1) index = i;
  });
  return index;
}

function randomMines() {
  let totalMines = 0;
  function generateMines() {
    for (let i = 0; i < tBoxVecs.length; i++) {
      if (Math.random() < 0.1 && totalMines < mines && tBoxVecs[i].status !== "💣") {
        tBoxVecs[i].status = "💣";
        totalMines++;
      }
    }
    if (totalMines < mines) generateMines();
  }
  generateMines();
}
randomMines();
//console.log(tBoxVecs);

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

function bombsNearby() {
  tBoxVecs.map( ({x, y, status}, i) => {
    //console.log("status: " + status);
    if (status === "💣") {
      tBoxVecs[i].status = status;
    } else {
      let bombs = findBombs(x, y, i);
      //console.log("bombs: " + bombs);
      bombs === 0 ? tBoxVecs[i].status = "" : tBoxVecs[i].status = bombs;
    }
  });
}
bombsNearby();

let boxesToClear = [];
function findEmptyBox(x, y) {
  let empty = []; 
  for (let y1 = Math.max(0, y - 1); y1 <= Math.min(height - 1, y + 1); y1++) {
    for (let x1 = Math.max(0, x - 1); x1 <= Math.min(width - 1, x + 1); x1++) {
      let testBox = tBoxVecs[tBoxesIndex(x1, y1)];
      let emptyBox = tBoxVecs[tBoxesIndex(x, y)];
      if (testBox.status === "" && testBox !== emptyBox) {
        empty.push([x1, y1]);
      } else if (testBox === emptyBox) {
        boxesToClear.push([x1, y1]);
      }
    }
  }
  return empty;
}

function clearBoxes(x, y) {
  for (let y1 = Math.max(0, y - 1); y1 <= Math.min(height - 1, y + 1); y1++) {
    for (let x1 = Math.max(0, x - 1); x1 <= Math.min(width - 1, x + 1); x1++) {
      let testBox = tBoxVecs[tBoxesIndex(x1, y1)];
      //console.log("testBox.status " + testBox.status);
      if (testBox.status === "💣") {
        //console.log("continue " + x1 + ": " + y1);
        continue;
      } else {
        //console.log("else " + x1 + ": " + y1);
        tBoxes[tBoxesIndex(x1, y1)].className = "box uncovered";
        tBoxes[tBoxesIndex(x1, y1)].textContent = testBox.status;
      }
    }
  }
}

function uncover(x, y) {
  let index = tBoxesIndex(x, y);
  tBoxes[index].className = "box uncovered"; 
  tBoxes[index].textContent = tBoxVecs[index].status;
  if (tBoxVecs[index].status === "💣") console.log("Game Over");
  if (tBoxVecs[index].status === "") {
    let empty = findEmptyBox(x, y);
    if (empty.length > 0) {
      //empty.forEach( ([x, y]) => uncover(x, y));
    }
  }
  boxesToClear.forEach( ([x, y]) => clearBoxes(x, y));
}

// need to fix here right click flags
function boxClick(event) {
  //console.log(event);
  let index = event.srcElement.id;
  let x = tBoxVecs[index].x, y = tBoxVecs[index].y;
  let text = tBoxes[index].textContent;

  if (event.button === 0) {
    uncover(x, y);
  }
  if (event.button === 2) {
    console.log(" right click");
    text === "⚑" ? tBoxes[index].textContent = "" : tBoxes[index].textContent = "⚑";
  }
  event.preventDefault();
}

tBoxes.forEach( x => {
  x.addEventListener("mousedown", boxClick);
});

