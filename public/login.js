const loginModal = document.getElementById("loginModal"),
      noAccount = document.getElementById("noAccount"),
      loginForm = document.getElementById("loginForm"),
      navLogin = document.getElementById("navLogin"),
      navLogout = document.getElementById("navLogout"),
      navCreateAccount = document.getElementById("navCreateAccount"),
      leaderBegginer = document.getElementById("leaderBeginner"),
      leaderIntermediate = document.getElementById("leaderIntermediate"),
      leaderExpert = document.getElementById("leaderExpert"),
      userScores = document.getElementById("userScores"),
      userBeginner = document.getElementById("userBeginner"),
      userIntermediate = document.getElementById("userIntermediate"),
      userExpert = document.getElementById("userExpert"),
      welcome = document.getElementById("welcome"),
      userNavLinks = document.getElementById("userNavLinks"),
      navChevron = document.getElementById("navChevron"),
      navButtons = document.querySelectorAll(".navButton"),
      gameContainer = document.getElementById("gameContainer"),
      scoresContainer = document.getElementById("scoresContainer"),
      leaderboard = document.getElementById("leaderboard")
let loggedIn,
    user,
    screenWidth,
    moreScores,
    lessScores,
    displayMoreScores,
    expandedScores

addEventListener("resize", resetScreenWidth)

function resetScreenWidth() {
  screenWidth = innerWidth
  if (!loggedIn && screenWidth > 1100) {
    gameContainer.style.marginLeft = "150px"
    scoresContainer.style.width = "150px"
  } else if (loggedIn && screenWidth > 1100) {
    gameContainer.style.marginLeft = "300px"
    scoresContainer.style.width = "300px"
    userScores.firstElementChild.style.marginBottom = "4px"
  } else {
    gameContainer.style.marginLeft = "auto"
    scoresContainer.style.width = "95%"
  }
}

(async function init() {
  screenWidth = innerWidth
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
          welcome.removeEventListener("click", handleUserNavLinks)
          navLogin.addEventListener("click", displayModal)
          navLogout.removeEventListener("click", logoutUser)
          userScores.style.display = "none"
          if (screenWidth > 1100) {
            gameContainer.style.marginLeft = "150px"
            scoresContainer.style.width = "150px"
            leaderboard.style.maxWidth = "100%"
          }
        }
        if (loggedIn) {
          welcome.style.display = "block"
          welcome.childNodes[0].innerText = `Welcome, ${user}!`
          welcome.addEventListener("click", handleUserNavLinks)
          navLogin.removeEventListener("click", displayModal)
          navLogin.parentElement.style.display = "none"
          navLogout.addEventListener("click", logoutUser)
          navCreateAccount.parentElement.style.display = "none"
          userScores.style.display = "flex"
          if (screenWidth > 1100) {
            gameContainer.style.marginLeft = "300px"
            scoresContainer.style.width = "300px"
            userScores.firstElementChild.style.marginBottom = "4px"
          }
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
  else addScoreboardEventListeners() 
  if (expandedScores) showMoreOrLessScores()
}

function setUserScores(res) {
  userScores.style.display = "flex"
  let userBeginnerList = createScoreList(res.userBeginner)
  userBeginner.innerHTML = userBeginnerList
  let userIntermediateList = createScoreList(res.userIntermediate)
  userIntermediate.innerHTML = userIntermediateList
  let userExpertList = createScoreList(res.userExpert)
  userExpert.innerHTML = userExpertList
  addScoreboardEventListeners()
}

function createScoreList(level) {
  let list = []
  for (let i = 0; i < 10; i++) {
    if (i == 5) {
      list.push(`<span class="moreScores" style="display: block;">Show More</span><div class="displayMoreScores" style="display: none;">`)
    }
    if (level[i] == undefined) {
      list.push(`<li class="scoreListItem"><span class="alignRight"></span></li>`)
    } else if (typeof level[i] == "number") {
      list.push(`<li class="scoreListItem">${user} <span class="alignRight">${level[i]}</span></li>`)
    } else {
      list.push(`<li class="scoreListItem">${level[i].username} <span class="alignRight">${level[i].score}</span></li>`)
    }
    if (i == 9) {
      list.push(`</div><span class="lessScores" style="display: none;">Show Less</span>`)
    }
  }
  return list.join("")
}

function addScoreboardEventListeners() {
  moreScores = document.querySelectorAll(".moreScores")
  // lessScores and displayMoreScores can now be difined at this point, they will be used subsequently
  lessScores = document.querySelectorAll(".lessScores")
  displayMoreScores = document.querySelectorAll(".displayMoreScores")
  moreScores.forEach( x => {
    x.addEventListener("click", showMoreOrLessScores)
  })
}

function handleUserNavLinks() {
  if (userNavLinks.style.display == "none") {
    userNavLinks.style.display = "flex"
    navChevron.classList.replace("fa-chevron-down", "fa-chevron-up")
  } else {
    userNavLinks.style.display = "none"
    navChevron.classList.replace("fa-chevron-up", "fa-chevron-down")
  }
}

function showMoreOrLessScores() {
  if (displayMoreScores[0].style.display == "none") {
    displayMoreScores.forEach( x => {
      x.style.display = "block"
    })
    moreScores.forEach( x => {
      x.style.display = "none"
      x.removeEventListener("click", showMoreOrLessScores)
    })
    lessScores.forEach( x => {
      x.style.display = "block"
      x.addEventListener("click", showMoreOrLessScores)
    })
    expandedScores = true
  } else {
    displayMoreScores.forEach( x => {
      x.style.display = "none"
    })
    moreScores.forEach( x => {
      x.style.display = "block"
      x.addEventListener("click", showMoreOrLessScores)
    })
    lessScores.forEach( x => {
      x.style.display = "none"
      x.removeEventListener("click", showMoreOrLessScores)
    })
    expandedScores = false
  }
}

noAccount.addEventListener("click", closeModal)

function displayModal() {
  loginModal.style.display = "block"
}
function closeModal() {
  loginModal.style.display = "none"
}

// login user
loginForm.addEventListener("submit", logInUser)

function logInUser(e) {
  const username = e.target.elements[0].value,
        password = e.target.elements[1].value,
        xhttp = new XMLHttpRequest()

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
    } 
    if (this.readyState == 4 && this.status == 200) {
      location.assign("/")
    }
  }
  xhttp.open("GET", "/logout", true)
  xhttp.send()
  e.preventDefault()
}

// responsive nav
const nav = document.querySelector(".nav"),
      navHamburger = document.getElementById("navHamburger"),
      navLinks = document.querySelectorAll(".navLink")

navHamburger.addEventListener("click", displayNav)
navLinks.forEach( x => {
  x.addEventListener("click", displayNav)
})

function displayNav() {
  if (nav.className == "nav") {
    nav.classList.add("navResponsive")
  }
  else nav.className = "nav"
}
