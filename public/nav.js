const nav = document.querySelector(".nav"), 
      navLinks = document.querySelectorAll(".navLink"),
      navHamburger = document.getElementById("navHamburger")

// responsive nav
// not all pages have a navHamburger
if (navHamburger) navHamburger.addEventListener("click", displayNav)

function displayNav() {
  if (nav.className == "nav") {
    nav.classList.add("navResponsive")
  }
  else nav.className = "nav"
}