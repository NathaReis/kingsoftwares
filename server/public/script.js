const $select = document.querySelector("#select")
const $play = document.querySelector("#play")
const $letter = document.querySelector("#letter")
const $link = document.querySelector("#link")
const $slide = document.querySelector("#slide")
const $buttons = document.querySelector(".buttons")
const $video = document.querySelector("#video")
const $audio = document.querySelector("audio")
const lettersMusicsTXTEndpoint = "letras.txt"
let lettersMusicTXT = []
let musicCurrentLink = ''
let isValidSong = false
let letterSlide = []
let currentSlidePosition = 0
let slideActiveted = false
localStorage.removeItem("letter") 

const findFetchText = (res) => res.text()
const splitFetchMusics = (res) => res.split("//")
const fillTitles = (musics) => {
    for(let position in musics) {
        const phrases = musics[position].split("\n")
        const option = document.createElement("option")
        option.value = position
        option.innerHTML = phrases[0]
        $select.appendChild(option)
    }
    return musics
}
fetch(lettersMusicsTXTEndpoint)
.then(findFetchText)
.then(splitFetchMusics)
.then(fillTitles)
.then(response => lettersMusicTXT = response)

function fillLetter() {
    if($select.value) {
        $letter.value = lettersMusicTXT[$select.value]
    }
    else {
        $letter.value = ""
    }
}

function alterHide() {
    $slide.classList.toggle('hide')
    $letter.classList.toggle('hide')
    $buttons.classList.toggle('hide')
}

function formatSlideLetter() {
    let res = []
    res = $letter.value.split('\n\n')
    res = res.map(p => p.split('\n'))
    const aux = res
    res = []
    aux.forEach(r => {
        r.forEach(element => {
            res.push(element)
        })
    })
    const last = res.length - 1
    !res[last] ? res[last] = 'Fim' : res.push('Fim')
    return res
}
 
function play() {       
    alterHide()
    slideActiveted = true
    letterSlide = formatSlideLetter()
    renderizar()
    apresentation()
}

function validFields() {
    if($letter.value.replace(/\s+/g, '') != '') {
        if(isValidSong) {
            play()
            $audio.play()                
        }// MP3
        else if(musicCurrentLink.replace(/\s+/g, '')) {
            play()
            $video.innerHTML = musicCurrentLink   
        }// URL
        else {
            play()
        }// Letter
    }
    else {
        alert('Sem letra!')
    }
}

function renderizar() {
    let letter = letterSlide[currentSlidePosition]
    $slide.innerHTML = letter
    localStorage.setItem("letter",letter)
}

function backSlide() {
    if(slideActiveted) {
        localStorage.removeItem("letter")
        musicCurrentLink = ''
        isValidSong = false
        letterSlide = []
        currentSlidePosition = 0
        slideActiveted = false
        $audio.src = ""
        $video.innerHTML = ""
        alterHide()
    }
}

const $corpo = document.querySelector('body')
$corpo.addEventListener('keydown', e => {
    const keyCode = e.keyCode

    switch(keyCode) {
        case 37: 
            if(currentSlidePosition > 0) {
                currentSlidePosition--
                renderizar()
            } 
            break 
        case 39:
            if(currentSlidePosition < letterSlide.length - 1) {
                currentSlidePosition++
                renderizar()
            }
            break 
        case 27:
            backSlide()
            break
    }
})

const $file = document.querySelector("#file")
$file.addEventListener("change", () => {
    const file = $file.files[0]
    console.log(file)
    if(file) {
        const fileExtension = file.name.split('.')[1]

        const allowedExtensions = ['mp3']

        if(allowedExtensions.includes(fileExtension.toLowerCase())) {
            isValidSong = true
            const reader = new FileReader();
            reader.onload = function(event) {
                $audio.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
        else {
            isValidSong = false
            alert('Extensão deve ser mp3!')
        }
    }
    else {
        isValidSong = false
        alert('Nenhum arquivo selecionado')
    }
})


function registerMusic(link) {
    if(link) {
        setTimeout(() =>
        {
            let iframe = `<iframe src="https://www.youtube.com/embed/${link}?autoplay=1" title="" frameborder="0" allow="autoplay; encrypted-media"></iframe>`
            musicCurrentLink = iframe
        },1)
    }
}

function getYouTubeVideoId() {
    const url = $link.value
    let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    let match = url.match(regExp);
    const response = (match && match[7].length == 11) ? match[7] : false
    registerMusic(response)
}

async function clipboard() {
    try {
        // Solicita permissão para acessar a área de transferência
        await navigator.permissions.query({ name: 'clipboard-read' });
    
        // Lê o texto da área de transferência
        const text = await navigator.clipboard.readText();
    
        // Define o texto no campo de entrada
        $link.value = text
        alert("Link colado!")
        console.log(text)
        getYouTubeVideoId()
    } 
    catch (err) {
        alert('Área de transferÊncia com erro!')
        console.error('Falha ao ler a área de transferência: ', err);
    }
}

// SLIDE 
function apresentation(){
	window.open("./windows/windows.html","_blank","toolbar=yes,location=yes,directories=no, status=no, menubar=yes,scrollbars=yes, resizable=no,copyhistory=yes, width=500px,height=500px")
}
// CLOCK 
function clock(){
	window.open("./clock/index.html","_blank","toolbar=yes,location=yes,directories=no, status=no, menubar=yes,scrollbars=yes, resizable=no,copyhistory=yes, width=500px,height=500px")
}