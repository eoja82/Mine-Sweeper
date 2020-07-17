const backToTop = document.getElementById("backToTop")
const backButton = document.getElementById("backButton")

addEventListener("scroll", showOnScroll)
backToTop.addEventListener("click", toTop)
backButton.addEventListener("click", previousPage)

function showOnScroll() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    backToTop.style.display = "block";
  } else {
    backToTop.style.display = "none";
  }
}

function toTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

function previousPage(e) {
  e.preventDefault()
  window.history.back()
}