//adding this script to any html file loads the navbar on top, do this on every page that's accessible to every user!

//create the navbar
const nav = document.createElement("nav")

//load the navbar
fetch('http://localhost:3000/navbar', {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
    }
})
.then(res=>res.text())
.then(data=>{
    //add the navbar to the page
    nav.innerHTML=data
    nav.setAttribute("style","top: 0px;")
    nav.setAttribute("class","navbar")
    document.body.appendChild(nav)
})