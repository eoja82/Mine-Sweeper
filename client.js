let width = 10, height = 10, size = 25, mines = 15;
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
console.log(tBoxVecs);

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


tBoxes.forEach( x => {
  x.addEventListener("click", buttonClick);
});

function buttonClick(event) {
  //console.log(event);
  let index = event.srcElement.id;
  tBoxes[index].className = "box uncoveredBlank";
  tBoxes[index].textContent = tBoxVecs[index].status;
  event.preventDefault();
}