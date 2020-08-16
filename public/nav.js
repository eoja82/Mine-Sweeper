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

// underline nav links on mouseenter
navLinks.forEach( x => {
  x.addEventListener("mouseenter", underlineNavLink)
})

function underlineNavLink(event) {
  // disable if touched not mouseenter
  if (event.webkitForce > 0 || event.mozPressure > 0) return;
  event.target.firstElementChild.style.visibility = "visible";
  event.target.firstElementChild.style.width = "100%";

  event.target.addEventListener("mouseleave", mouseOut);

  function mouseOut(event) {
    event.target.firstElementChild.style.visibility = "hidden";
    event.target.firstElementChild.style.width = "0";
  }
}