const nav = document.createElement("nav")

fetch('http://localhost:3000/navbar', {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
    }
})
.then(res=>res.text())
.then(data=>{
    nav.innerHTML=data
    nav.setAttribute("style","top: 0px;")
    nav.setAttribute("class","navbar")
    document.body.appendChild(nav)
})