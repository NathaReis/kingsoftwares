const $btn = document.querySelector("#play")
const $letra = document.querySelector("#letter")
const $linkDaMusica = document.querySelector("#linkDaMusica")
const $audio = document.querySelector("audio")
const $slide = document.querySelector(".slide")
const $video = document.querySelector(".video")
let musicaLinkAtual = ''
let audio_valid = false
let slide_letra = []
let pos = 0

$letra.value = `No deserto de quem eu fui, eu tinha sede
Veio Cristo e tudo se fez diferente

Ele vê meus pecados ocultos
O que escondo no fundo do meu coração
Derrama em minha vida a água
Limpa a sujeira e sacia essa sede
O que Cristo oferece, Ele é

No escuro de quem eu fui, eu tinha medo
Veio Cristo e tudo se fez diferente

Ele enxerga o que vejo no escuro
O que escondo do fundo no meu coração
E espalha o barro que ainda faltava
Abre a janela pra luz me encontrar
O que Cristo oferece, Ele é

Luz do Mundo, Água Viva
Cristo, Ele é Cristo, Ele é Cristo

Ele tira o pecado do mundo
Planta a esperança na terra do meu coração
Cristo, Pão que alimenta o faminto
Vinho esmagado e servido na cruz para todo cansado
O que Cristo oferece, Ele é`

function play() {            
    let res = []

    res = $letra.value.split('\n\n')
    res = res.map(p => p.split('\n'))
    const aux = res
    res = []
    aux.forEach(r => {
        r.forEach(element => {
            res.push(element)
        })
    })

    slide_letra = res 
    $slide.innerHTML = slide_letra[pos]
}

const btn =  () => {
    console.log('o')
    if($btn.innerHTML == 'Play')
    {
        if($letra.value.replace(/\s+/g, '') != '') {
            if(audio_valid) {
                $slide.classList.toggle('hide')
                $btn.classList.toggle('active')
                pos = -1

                play()

                $btn.innerHTML = 'Voltar'
                $audio.play()                
            }
            else if(musicaLinkAtual.replace(/\s+/g, '')) {
                $slide.classList.toggle('hide')
                $btn.classList.toggle('active')
                pos = -1

                play()

                $btn.innerHTML = 'Voltar'
                $video.innerHTML = musicaLinkAtual   
            }
        }
        else {
            alert('Campo(s) vazios!')
        }
    }
    else 
    {
        $slide.classList.toggle('hide')
        $btn.classList.toggle('active')
        $btn.innerHTML = 'Play'
        $audio.pause()
        $audio.currentTime = 0
    }
}

const renderizar = () => {
    $slide.innerHTML = slide_letra[pos]
}

const $corpo = document.querySelector('body')
$corpo.addEventListener('keydown', e => {
    if(e.keyCode == 37) {
        if(pos > 0) {
            pos--
            renderizar()
        }
    }
    else if(e.keyCode == 39) {
        if(pos < slide_letra.length - 1) {
            pos++
            renderizar()
        }
    }
    // else if(e.keyCode == 27) {
    //     if($btn.innerHTML == 'Voltar') {
    //         btn()
    //     }
    // }
    // else if(e.keyCode == 13) {
    //     if($btn.innerHTML == 'Play') {
    //         btn()
    //     }
    // }
})

const $file = document.querySelector("#file")

$file.addEventListener("change", () => {
    const file = $file.files[0]
    console.log(file)
    if(file) {
        const fileExtension = file.name.split('.')[1]

        const allowedExtensions = ['mp3']

        if(allowedExtensions.includes(fileExtension.toLowerCase())) {
            audio_valid = true
            const reader = new FileReader();
            reader.onload = function(event) {
                $audio.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
        else {
            audio_valid = false
            alert('Extensão deve ser mp3!')
        }
    }
    else {
        audio_valid = false
        alert('Nenhum arquivo selecionado')
    }
})


function rodarMusica(link) {
    if(link) {
        setTimeout(() =>
        {
            let iframe = `<iframe src="https://www.youtube.com/embed/${link}?autoplay=1" title="" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`
            musicaLinkAtual = iframe
        },1)
    }
}



function getYouTubeVideoId() {
    const url = $linkDaMusica.value
    let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    let match = url.match(regExp);
    const retorno = (match && match[7].length == 11) ? match[7] : false
    rodarMusica(retorno)
}

async function clipboard() {
    try {
        // Solicita permissão para acessar a área de transferência
        await navigator.permissions.query({ name: 'clipboard-read' });
    
        // Lê o texto da área de transferência
        const text = await navigator.clipboard.readText();
    
        // Define o texto no campo de entrada
        $linkDaMusica.value = text
        getYouTubeVideoId()
    } 
    catch (err) {
        console.error('Falha ao ler a área de transferência: ', err);
    }
}