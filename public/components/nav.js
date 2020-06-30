const nav = document.querySelector(".nav");
const navLinks = [
  {link: "Home", href: "/"}, 
  {link: "Create An Account", href: "/createaccount"},
  {link: "Log In", href: "javascript:void(0)", id: "login"}
];

navLinks.forEach( x => {
  let button = document.createElement("button");
  button.className = "navButton";
  let a = document.createElement("a");
  a.innerText = x.link;
  a.href = x.href;
  a.className = "navLink";
  if (x.id) a.id = x.id;
  let hr = document.createElement("hr");
  a.appendChild(hr);
  button.appendChild(a);
  nav.appendChild(button);
});