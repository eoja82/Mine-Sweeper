const createAccountForm = document.getElementById("createAccountForm")
const createErrorMessage = document.getElementById("createErrorMessage")
const privacyPolicy = document.getElementById("privacyPolicy")
const privacyLink = document.getElementById("privacyLink")
//console.log(privacyPolicy)
const closePrivacyPolicy = document.getElementById("closePrivacyPolicy")
const deleteAccountForm = document.getElementById("deleteAccountForm")
const deleteErrorMessage = document.getElementById("deleteErrorMessage")

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
  xhttp.open("POST", "/createaccount/newuser", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(`username=${username}&email=${email}&password=${password}&passwordAgain=${passwordAgain}`);
  e.preventDefault()
}

// delete users' account and users' leaderboard scores if any
deleteAccountForm.addEventListener("submit", deleteUserAccount, true)

function deleteUserAccount(e) {
  const formData = e.target.elements,
        username = formData[0].value,
        password = formData[1].value,
        xhttp = new XMLHttpRequest();

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
  xhttp.open("DELETE", "/accounts/deleteuser", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(`username=${username}&password=${password}`);
  e.preventDefault()
}