const loginModal = document.getElementById("loginModal");
//const close = document.getElementById("close");
const noAccount = document.getElementById("noAccount");
//const login = document.getElementById("login");
const loginForm = document.getElementById("loginForm")
const login = document.getElementById("login")
let loggedIn;

(async function loggedInStatus() {
  await checkIfLoggedIn()
})();

function checkIfLoggedIn() {
  const xhttp = new XMLHttpRequest()
  return new Promise( (resolve, reject) => {
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status >= 400) {
        console.log("error checking login status")
        reject()
      } 
      if (this.readyState == 4 && this.status == 200) {
        const res = JSON.parse(this.response)
        //console.log(res.loggedIn)
        loggedIn = res.loggedIn
        if (!loggedIn) {
          //addEventListener("load", displayModal)
          displayModal()
          login.textContent = "Log In"
          login.addEventListener("click", displayModal)
          login.removeEventListener("click", logoutUser)
        }
        if (loggedIn) {
          //console.log("logged In")
          login.textContent = "Log Out"
          login.removeEventListener("click", displayModal)
          login.addEventListener("click", logoutUser)
        }
        resolve()
      }
    }
    xhttp.open("GET", "/loggedin", true)
    xhttp.send()
  })
}


noAccount.addEventListener("click", closeModal);
//login.addEventListener("click", displayModal);

function displayModal() {
  loginModal.style.display = "block";
}
function closeModal() {
  loginModal.style.display = "none";
  console.log("close modal");
}

// login user
loginForm.addEventListener("submit", logInUser); 

function logInUser(e) {
  const username = e.target.elements[0].value;
  const password = e.target.elements[1].value;
  console.log(this.readyState + " " + this.status);
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    
    if (this.readyState == 4 && this.status == 200) {
      alert(this.response);
    }
    if (this.readyState == 4 && this.status == 307) {
      const res = JSON.parse(this.response)
      loggedIn = res.loggedIn
      location.assign(res.location)
    }
  }
  xhttp.open("POST", "/login", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(`username=${username}&password=${password}`);
  e.preventDefault();
}

// log out user 
function logoutUser(e) {
  const xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status >= 400) {
      alert(this.response);
      console.log("error logging out");
    } 
    if (this.readyState == 4 && this.status == 200) {
      alert(this.response);
      location.assign("/")
    }
  }
  xhttp.open("GET", "/logout", true)
  xhttp.send()
  e.preventDefault()
}