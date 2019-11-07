let width = 5, height = 5, size = 25;
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

function randomBombs() {
  tBoxVecs.map( x => {
    if (Math.random() < 0.3) {
      x.status = "💣";
    } else {
      x.status = "";
    }
  });
}
randomBombs();
console.log(tBoxVecs);
// need to fix
function findBombs(x, y, i) {
  let bombs = 0
  let box = tBoxVecs[i];
  for (let y1 = Math.max(0, y - 1); y1 <= Math.min(height - 1, y + 1); y1++) {
    for (let x1 = Math.max(0, x - 1); x1 <= Math.min(width - 1, x + 1); x1++) {
      let testBox = tBoxVecs[tBoxesIndex(x1, y1)];
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
  tBoxVecs.map( ({x, y, status}, i) => {
    if (status === "💣") {
      status = status;
    } else {
      let bombs = findBombs(x, y, i);
      bombs === 0 ? status = "" : status = bombs;
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