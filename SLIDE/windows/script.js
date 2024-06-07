const $slide = document.querySelector("#slide")
setInterval(() => {
    let letter = localStorage.getItem("letter")
    $slide.innerHTML = letter
    if(!letter) {
        window.close()
    }
},1)