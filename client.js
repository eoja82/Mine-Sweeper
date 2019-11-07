let width = 5, height = 5, size = 25;
let inputBoxes = [], inputVecs = [];

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
  for (let x = 0; x < width; x++) {
    let divRow = document.createElement("div");
    divRow.className = "row";
    let inputBox = document.createElement("input");
    inputBox.type = "button";
    inputBox.textContent = "";
    inputBox.id = x + (y * width);
    inputBox.className = "box covered";
    inputBox.style = "width: " + size + "px;  height: " + size + "px;";
    divRow.appendChild(inputBox);
    grid.appendChild(inputBox);
    inputBoxes.push(inputBox);
    inputVecs.push(new Vec(x, y));
  }
  grid.appendChild(document.createElement("br"));
}

function inputBoxesIndex(x1, y1) {
  let index; 
  inputVecs.forEach( (z, i) => {
    if (z.x === x1 && z.y === y1) index = i;
  });
  return index;
}

function randomBombs() {
  inputVecs.map( x => {
    if (Math.random() < 0.3) {
      x.status = "💣";
    } else {
      x.status = "";
    }
  });
}
randomBombs();
//console.log(inputVecs);
// need to fix
function findBombs(x, y, i) {
  let bombs = 0
  let box = inputVecs[i];
  for (let y1 = Math.max(0, y - 1); y1 <= Math.min(height - 1, y + 1); y1++) {
    for (let x1 = Math.max(0, x - 1); x1 <= Math.min(width - 1, x + 1); x1++) {
      let testBox = inputVecs[inputBoxesIndex(x1, y1)];
      if (testBox === box) {
        continue;
      } else {
        console.log(`box.status === ${box.status === "💣"}`)
        if (box.status === "💣") {
          bombs++;
        }
      }
    }
  }
  return bombs;
}

function bombsNearby() {
  inputVecs.map( ({x, y, status}, i) => {
    if (status === "💣") {
      status = status;
    } else {
      let bombs = findBombs(x, y, i);
      bombs === 0 ? status = "" : status = bombs;
    }
  });
}
bombsNearby();


inputBoxes.forEach( x => {
  x.addEventListener("click", buttonClick);
});

function buttonClick(event) {
  //console.log(event);
  let index = event.srcElement.id;
  inputBoxes[index].className = "box uncoveredBlank";
  inputBoxes[index].value = inputVecs[index].status;
  event.preventDefault();
}