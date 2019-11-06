let width = 20, height = 20, size = 20;
let divBoxes = [], divVecs = [];

class Vec {
  constructor(x, y, status) {
    this.x = x;
    this.y = y;
    this.status = status;
  }
}

let grid = document.getElementById("grid");
grid.style = "width: " + width * size + "px; height: " + height * size + "px;";

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    let divRow = document.createElement("div");
    divRow.className = "row";
    let divBox = document.createElement("input");
    divBox.type = "button";
    divBox.textContent = "";
    divBox.id = x + (y * width);
    divBox.className = "box";
    divBox.style = "width: " + size + "px;  height: " + size + "px;";
    divRow.appendChild(divBox);
    grid.appendChild(divBox);
    divBoxes.push(divBox);
    divVecs.push(new Vec(x, y));
  }
  grid.appendChild(document.createElement("br"));
}

divBoxes.forEach( x => {
  x.addEventListener("click", buttonClick);
})