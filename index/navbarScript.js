const nav = document.querySelector('.navbar')
fetch('http://localhost:3000/navbar', {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
    }
})
.then(res=>res.text())
.then(data=>{
    nav.innerHTML=data
})