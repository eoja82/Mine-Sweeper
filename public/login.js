const loginModal = document.getElementById("loginModal");
const close = document.getElementById("close");
const noAccount = document.getElementById("noAccount");
const login = document.getElementById("login");
let loggedIn = false;

addEventListener("load", displayModal);
noAccount.addEventListener("click", closeModal);
login.addEventListener("click", displayModal);

function displayModal() {
  loginModal.style.display = "block";
}
function closeModal() {
  loginModal.style.display = "none";
  console.log("close modal")
}
