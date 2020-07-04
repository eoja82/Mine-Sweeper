const loginModal = document.getElementById("loginModal")
//const close = document.getElementById("close")
const noAccount = document.getElementById("noAccount")
//const login = document.getElementById("login")
const loginForm = document.getElementById("loginForm")
const login = document.getElementById("login")
const leaderBegginer = document.getElementById("leaderBeginner")
const leaderIntermediate = document.getElementById("leaderIntermediate")
const leaderExpert = document.getElementById("leaderExpert")
const userScores = document.getElementById("userScores")
const userBeginner = document.getElementById("userBeginner")
const userIntermediate = document.getElementById("userIntermediate")
const userExpert = document.getElementById("userExpert")
const welcome = document.getElementById("welcome")
const navButtons = document.querySelectorAll(".navButton")
let loggedIn,
    user

/* addEventListener("DOMContentLoaded", loadData)

async function loadData() {

} */

(async function init() {
  await getScoresLoginStatus()
})();

function getScoresLoginStatus() {
  const xhttp = new XMLHttpRequest()
  return new Promise( (resolve, reject) => {
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status >= 400) {
        console.log("error checking login status")
        reject()
      } 
      if (this.readyState == 4 && this.status == 200) {
        const res = JSON.parse(this.response)
        loggedIn = res.loggedIn
        user = res.username

        setLeaderboardScores(res, loggedIn)
        
        if (!loggedIn) {
          displayModal()
          welcome.style.display = "none"
          login.childNodes[0].nodeValue = "Log In"
          login.addEventListener("click", displayModal)
          login.removeEventListener("click", logoutUser)
          userScores.style.display = "none"
        }
        if (loggedIn) {
          //console.log("logged In")
          welcome.style.display = "block"
          welcome.innerText = `Welcome, ${user}!`
          login.childNodes[0].nodeValue = `Log Out ${user}`
          login.removeEventListener("click", displayModal)
          login.addEventListener("click", logoutUser)
          userScores.style.display = "block"
        }
        resolve()
      }
    }
    xhttp.open("GET", "/init", true)
    xhttp.send()
  })
}

function setLeaderboardScores(res, loggedIn) {
  let leaderBeginnerList = createScoreList(res.leaderBeginner)
  leaderBegginer.innerHTML = leaderBeginnerList
  let leaderIntermediateList = createScoreList(res.leaderIntermediate)
  leaderIntermediate.innerHTML = leaderIntermediateList
  let leaderExpertList = createScoreList(res.leaderExpert)
  leaderExpert.innerHTML = leaderExpertList
  if (loggedIn) setUserScores(res)
}

function setUserScores(res) {
  userScores.style.display = "block"
  //console.log("Begin level " + res.userBeginner)
  let userBeginnerList = createScoreList(res.userBeginner)
  userBeginner.innerHTML = userBeginnerList
  //console.log("Inter level " + res.userIntermediate)
  let userIntermediateList = createScoreList(res.userIntermediate)
  userIntermediate.innerHTML = userIntermediateList
  //console.log("expert level " + res.userExpert)
  let userExpertList = createScoreList(res.userExpert)
  userExpert.innerHTML = userExpertList
}

function createScoreList(level) {
  //console.log(level)  // undefined for user scores
  let list = []
  level.forEach( x => {
    //console.log(typeof x)
    if (typeof x == "number") {
      list.push(`<li class="scoreListItem">${user} <span class="alignRight">${x}</span></li>`)
    } else {
      list.push(`<li class="scoreListItem">${x.username} <span class="alignRight">${x.score}</span></li>`)
    }
    
  })
  return list.join("")
}


noAccount.addEventListener("click", closeModal)
//login.addEventListener("click", displayModal)

function displayModal() {
  //console.log("displaying modal")
  loginModal.style.display = "block"
}
function closeModal() {
  loginModal.style.display = "none"
  //console.log("close modal")
}

// login user
loginForm.addEventListener("submit", logInUser)

function logInUser(e) {
  const username = e.target.elements[0].value
  const password = e.target.elements[1].value
  console.log(`${username} ${password}`)
  console.log(this.readyState + " " + this.status)
  const xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    
    if (this.readyState == 4 && this.status == 200) {
      alert(this.response)
    }
    if (this.readyState == 4 && this.status == 307) {
      const res = JSON.parse(this.response)
      loggedIn = res.loggedIn
      user = res.username
      location.assign(res.location)
    }
  }
  xhttp.open("POST", "/login", true)
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
  xhttp.send(`username=${username}&password=${password}`)
  e.preventDefault()
}

// log out user 
function logoutUser(e) {
  const xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status >= 400) {
      alert(this.response)
      console.log("error logging out")
    } 
    if (this.readyState == 4 && this.status == 200) {
      alert(this.response)
      location.assign("/")
    }
  }
  xhttp.open("GET", "/logout", true)
  xhttp.send()
  e.preventDefault()
}