const createAccountForm = document.getElementById("createAccountForm"),
      createErrorMessage = document.getElementById("createErrorMessage"),
      privacyPolicy = document.getElementById("privacyPolicy"),
      privacyLink = document.getElementById("privacyLink"),
      closePrivacyPolicy = document.getElementById("closePrivacyPolicy"),
      deleteAccountForm = document.getElementById("deleteAccountForm"),
      deleteErrorMessage = document.getElementById("deleteErrorMessage"),
      createAccountContainer = document.getElementById("createAccountContainer"),
      deleteAccountContainer = document.getElementById("deleteAccountContainer"),
      changePasswordContainer = document.getElementById("changePasswordContainer"),
      changePasswordForm = document.getElementById("changePasswordForm")
      changePasswordErrorMessage = document.getElementById("changePasswordErrorMessage")
let loggedIn

// if !loggedIn hide delete account, if loggedIn hide create account
(async function init() {
  await getLoginStatus()
})();

function getLoginStatus() {
  return new Promise( (resolve, reject) => {
    const xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status >= 400) {
        console.log("error checking login status")
        reject()
      } 
      if (this.readyState == 4 && this.status == 200) {
        const res = JSON.parse(this.response)
        console.log(res.loggedIn)
        loggedIn = res.loggedIn
        if (loggedIn) {
          createAccountContainer.style.display = "none"
          changePasswordContainer.style.display = "block"
          deleteAccountContainer.style.display = "block"
        } else {
          createAccountContainer.style.display = "block"
          changePasswordContainer.style.display = "none"
          deleteAccountContainer.style.display = "none"
        }
        resolve()
      }
    }
    xhttp.open("GET", "/init/accounts", true)
    xhttp.send()
  })
}

privacyLink.addEventListener("click", displayPolicy)
closePrivacyPolicy.addEventListener("click", displayPolicy)

function displayPolicy() {
  if (privacyPolicy.style.display == "none") {
    privacyPolicy.style.display = "block"
  } else {
    privacyPolicy.style.display = "none"
  }
}

// create new user account
createAccountForm.addEventListener("submit", createNewUserAccount, true)

function createNewUserAccount(e) {
  const formData = e.target.elements,
        username = formData[0].value,
        email = formData[1].value,
        password = formData[2].value,
        passwordAgain = formData[3].value,
        xhttp = new XMLHttpRequest();

  if (typeof username == "number" && username.length > 20) {
    createErrorMessage.innerHTML = "Username max length is 20 characters."
    return
  }

  /* const xhttp = new XMLHttpRequest(); */
  xhttp.onreadystatechange = function() {
    //console.log(this.readyState + " " + this.status)
    if (this.readyState == 4 && this.status >= 400) {
      alert(this.response);
      console.log("error creating new user");
    } 
    if (this.readyState == 4 && this.status == 200) {
      createErrorMessage.innerHTML = this.response;
    }
    if (this.readyState == 4 && this.status == 307) {
      alert(this.response)
      location.assign("/")
    }
  }
  xhttp.open("POST", "/accounts/useraccount", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(`username=${username}&email=${email}&password=${password}&passwordAgain=${passwordAgain}`);
  e.preventDefault()
}

// change password
changePasswordForm.addEventListener("submit", changeUserPassword)

function changeUserPassword(e) {
  e.preventDefault()
  const formData = e.target.elements,
        //username = req.session.username,
        oldPassword = formData[0].value,
        newPassword = formData[1].value,
        confirmNewPassword = formData[2].value
        xhttp = new XMLHttpRequest()
  console.log(newPassword)
  if (oldPassword == newPassword) {
    changePasswordErrorMessage.innerHTML = "New password must be different than old password."
    return
  } else if (newPassword != confirmNewPassword) {
    changePasswordErrorMessage.innerHTML = "New passwords do not match."
    return
  } else {
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status >= 400 ||
        this.readyState == 4 && this.status == 100) {
          changePasswordErrorMessage.innerHTML = this.response
      } 
      if (this.readyState == 4 && this.status == 200) {
        alert(this.response)
        changePasswordForm.reset()
      }
    }
    xhttp.open("PUT", "/accounts/useraccount", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(`oldPassword=${oldPassword}&newPassword=${newPassword}`);
  } 
  /* e.preventDefault() */
}

// delete users' account and users' leaderboard scores if any
deleteAccountForm.addEventListener("submit", deleteUserAccount, true)

function deleteUserAccount(e) {
  const formData = e.target.elements,
        username = formData[0].value,
        password = formData[1].value,
        xhttp = new XMLHttpRequest()

  xhttp.onreadystatechange = function() {
    console.log(this.readyState + " " + this.status)
    if (this.readyState == 4 && this.status >= 400) {
      alert(this.response);
      console.log("error deleting user");
    } 
    if (this.readyState == 4 && this.status == 200) {
      deleteErrorMessage.innerHTML = this.response;
    }
    if (this.readyState == 4 && this.status == 307) {
      alert(this.response)
      location.assign("/")
    }
  }
  xhttp.open("DELETE", "/accounts/useraccount", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(`username=${username}&password=${password}`);
  e.preventDefault()
}