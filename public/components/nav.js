const nav = document.querySelector(".nav");
const navLinks = [
  {link: "Home", href: "/"}, 
  {link: "Create An Account", href: "/createaccount"},
  {link: "Log In", href: "/", id: "login"}
];

navLinks.forEach( x => {
  let button = document.createElement("button");
  button.className = "navButton";
  if (x.id) button.id = x.id;
  let a = document.createElement("a");
  a.innerText = x.link;
  a.href = x.href;
  a.className = "navLink";
  let hr = document.createElement("hr");
  a.appendChild(hr);
  button.appendChild(a);
  nav.appendChild(button);
});