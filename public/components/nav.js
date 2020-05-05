const nav = document.querySelector(".nav");
const navLinks = [
  {link: "Home", href: "/"}, 
  {link: "Create An Account", href: "/createaccount"},
  {link: "Log In", href: "/"}
];

navLinks.forEach( x => {
  let button = document.createElement("button");
  button.className = "navButton";
  //if (x.href !== "none") {
    let a = document.createElement("a");
    a.innerText = x.link;
    a.href = x.href;
    a.className = "navLink";
    let hr = document.createElement("hr");
    a.appendChild(hr);
    button.appendChild(a);
  //}
  /* if (x.href === "none") {
    button.innerText = x.link;
    button.id = "login";
    let hr = document.createElement("hr");
    button.appendChild(hr);
  } */
  nav.appendChild(button);
});