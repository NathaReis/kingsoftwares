console.log('1.5')
console.log("Esta versão possui a opção de visualizar demais tela")

// BTNS HEADER
function rel(){
	window.open("./relogio.html","_blank","toolbar=yes, 				location=yes, 					directories=no, status=no, menubar=yes, 			scrollbars=yes, resizable=no, 					copyhistory=yes, width=500px, 			height=500px")
}
function tem(){
	window.open("./temporizador.html","_blank","toolbar=yes, 				location=yes, 					directories=no, status=no, menubar=yes, 			scrollbars=yes, resizable=no, 					copyhistory=yes, width=500px, 			height=500px")
}
function sair(){
	carregar()
    firebase.auth().signOut()
    .then(() =>
    {
		nao_carregar()
		localStorage.setItem('user', '')
        location = "./index.html"
    })
    .catch(error =>
        {
			nao_carregar()
            alert('Erro ao sair!')
            console.log(error)
        })
}
const add = () =>
{
	location = './add.html'
}
const monitores = () =>
{
	$monitores.style.display = 'block'
	$retorno.style.display = 'none'
}

//BUSCAR O USER
firebase.auth().onAuthStateChanged(user =>
	{
		if(user)
		{
			localStorage.setItem('user', user.uid)
			buscandoRegistros()
		}
	})

// Música
const $retorno = document.querySelector('#retorno')
const $search = document.querySelector('#search')
const $musica_atual = document.querySelector('#musica_atual')
const $div_iframe = document.querySelector('#div_iframe')
const $tela = document.querySelector('#tela')
const $btn_play = document.querySelector('#btn_play')
const $btn_back = document.querySelector('#btn_back')
const loading = document.querySelector("#carregando")
const $monitores = document.querySelector("#monitores")

const carregar = () =>
{
	loading.style.display = 'block'
}
const nao_carregar = () =>
{
	loading.style.display = 'none'
}

let musica_atual = '' // para trabalhar com os botões de controle e a função rodarMusica()
let cantor_atual = '' // para manter no mesmo cantor na função de finalizaradd / excluir música
let busca // resultado da busca completa
let cantores = [] // lisa dos cantores sem repetir os nomes

const isCelular = () =>
{
	let corpo_width = +window.getComputedStyle(document.body).width.replace('px','')
	let corpo_height = +window.getComputedStyle(document.body).height.replace('px','')

	if(corpo_height <= 700 && corpo_width <= 500)
	{
		return true
	}
	else
	{
		return false
	}
}

function reset()
{
	cantores = []
	musica_atual = ''
    $search.value = ''
    $retorno.innerHTML = '' 
	$retorno.style.display = 'grid'
	$musica_atual.innerHTML = 'Música'
	$div_iframe.innerHTML = '' 
	$btn_play.disabled = $btn_back.disabled = true
	$tela.style.cursor = 'not-allowed'
	$div_iframe.style.display = 'none'
	$monitores.style.display = 'none'
}

const recarregar = () =>
{
	reset()
	buscandoRegistros()
}

const tela = () =>
{ 
	let cursor = window.getComputedStyle($tela).cursor
	if(cursor != 'not-allowed')
	{
		let elemento = document.getElementsByTagName('iframe')[0]
		let e_src = elemento.src.replace('?autoplay=1','')
		window.open(e_src, "_blank","toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes, width=500px, height=500px");	
		controlVideo('back')
	}
}

const removeMusica = (uid) =>
{
	if(confirm("Deseja excluir esta música?"))
	{
		firebase.firestore()
        .collection('cantores')
        .doc(uid)
        .delete()	
		.then(() =>
		{
			recarregar()
		})
		.catch(error =>
			{
				alert("Error ao excluir")
				console.log("Erro: "+error)
			})
	}
}

const removeCantor = (cantor) =>
{
	if(confirm('Deseja excluir este cantor?'))
	{
		let uids = []
		busca.forEach(b =>
			{
				if(b.cantor == cantor)
				{
					uids.push(b.uid)
				}
			})
	
		uids.forEach(uid =>
			{
				firebase.firestore()
				.collection('cantores')
				.doc(uid)
				.delete()	
				.then(() =>
				{
					console.log('ok')
				})
				.catch(error =>
					{
						alert("Error ao excluir")
						console.log("Erro: "+error)
					})
			})

		setTimeout(() => {recarregar()}, +uids.length * 100)
	}
}

const buscandoRegistros = () =>
{
	carregar()
	const user = localStorage.getItem('user')

	firebase.firestore()
	.collection('cantores')
	.where('user.uid', '==', user)
	.get()
	.then(registros =>
		{
			nao_carregar()
			busca = registros.docs.map(doc => ({
				...doc.data(),
				uid: doc.id
			}))
			busca.forEach(b => {
				
				if(cantores.indexOf(b.cantor) == -1)
				{
					cantores.push(b.cantor)
				}

				$search.placeholder = 'Cantor'
			})	

			cantores.forEach(c =>
				{
					let div = document.createElement("div")
					div.className = 'box_cantor'

					let button = document.createElement('button')
					button.innerHTML = c
					button.className = 'btn_cantor'
					button.onclick = () =>
					{
						cantor_atual = c
						musicasPorCantor(c)
					}
					div.appendChild(button)

					let lixeira = document.createElement('img')
					lixeira.src = "./styles/lixeira.svg"
					lixeira.onclick = () =>
					{
						removeCantor(c)
					}
					div.appendChild(lixeira)

					$retorno.appendChild(div)
				})	
		})
	.catch(error =>
		{
			nao_carregar()
			console.log(error)
		})
}

const musicasPorCantor = (cantor) =>
{
	carregar()
	$retorno.innerHTML = ''
    $search.placeholder = 'Música'
	
	busca.forEach(b =>
		{
			if(b.cantor == cantor)
			{
				let div = document.createElement("div")
				div.className = 'box_cantor'

				let button = document.createElement('button')
				button.innerHTML = b.musica
				button.className = 'btn_cantor'
				button.onclick = () =>
				{
					rodarMusica(b.link, b.musica)
				}
				div.appendChild(button)

				let lixeira = document.createElement('img')
				lixeira.src = "./styles/lixeira.svg"
				lixeira.onclick = () =>
				{
					removeMusica(b.uid)
				}
				div.appendChild(lixeira)

				$retorno.appendChild(div)
			}
		})
	nao_carregar()
}

const rodarMusica = (link, musica) =>
{
	controlVideo('back')
	setTimeout(() =>
	{
		let iframe = `<iframe src="${link}" title="" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`
		musica_atual = iframe
		$btn_play.disabled = false
		$musica_atual.innerHTML = musica
	},1)
}

const controlVideo = (vidFunc) =>
{
	let src_link = ''
	switch(vidFunc)
	{
		case 'play':
			if(isCelular())
			{
				$retorno.style.display = 'none'
				$div_iframe.style.display = 'block'

				src_link = musica_atual
				$div_iframe.innerHTML  = src_link
				tela()
			}
			else
			{
				$retorno.style.display = 'none'
				$div_iframe.style.display = 'block'

				src_link = musica_atual
				$tela.style.cursor = 'pointer' 
				$btn_back.disabled = false
				$btn_play.disabled = true
				$div_iframe.innerHTML  = src_link
			}
			break
		case 'back':
			$div_iframe.style.display = 'none'
			$retorno.style.display = 'block'

			src_link = ''
			$tela.style.cursor = 'not-allowed'
			$btn_back.disabled = true
			$btn_play.disabled = false
			$div_iframe.innerHTML  = src_link
			break
	}
}

const pesquisa = () =>
{
	let pesquisa = $search.value
	pesquisa = pesquisa.toLowerCase()
	
	if($search.placeholder == 'Cantor')
	{
		console.log('Pesquisa por cantor')

		let cantores_pesquisa = []
		cantores.forEach(c =>
			{
				let encontrado = false
				let cantor_pesquisa1 = (c.toLowerCase() == pesquisa)
				let cantor_pesquisa2 = (c.toLowerCase().replace(`${pesquisa}`,'') != c.toLowerCase())
				if(cantor_pesquisa1)
				{
					encontrado = true
					$search.value = ''
					musicasPorCantor(c)
				}
				else if(cantor_pesquisa2)
				{
					cantores_pesquisa.push(c)
					$search.value = ''
					$retorno.innerHTML = ''
					cantores_pesquisa.forEach(c =>
						{
							let div = document.createElement("div")
							div.className = 'box_cantor'
		
							let button = document.createElement('button')
							button.innerHTML = c
							button.className = 'btn_cantor'
							button.onclick = () =>
							{
								musicasPorCantor(c)
							}
							div.appendChild(button)
		
							let lixeira = document.createElement('img')
							lixeira.src = "../styles/lixeira.svg"
							lixeira.onclick = () =>
							{
								removeCantor(c)
							}
							div.appendChild(lixeira)
		
							$retorno.appendChild(div)
						})	
				}
				else if(encontrado)
				{
					$search.value = ''
					$search.placeholder = 'Cantor em falta!'
				}
				else
				{
					$search.value = ''
				}
			})
		
	}
	else
	{
		console.log('Pesquisa por música')
		let musicas_pesquisa = []

		busca.forEach(b =>
			{
				let encontrado = false
				let musica_pesquisa1 = (pesquisa == b.musica.toLowerCase())
				let musica_pesquisa2 = (b.musica.toLowerCase().replace(pesquisa,'') != b.musica.toLowerCase())

				if(musica_pesquisa1)
				{
					encontrado = true
					$search.value = ''
					rodarMusica(b.link, b.musica)
				}
				else if(musica_pesquisa2)
				{
					if(b.cantor == $cantor.value)
					{
						musicas_pesquisa.push(b.musica)
						$search.value = ''
						$retorno.innerHTML = ''
	
						musicas_pesquisa.forEach(m =>
							{
								let button = document.createElement('button')
								button.innerHTML = m
								button.className = 'btn_cantor'
								button.onclick = () =>
								{
									rodarMusica(b.link, b.musica)
								}
								div.appendChild(button)
				
								let lixeira = document.createElement('img')
								lixeira.src = "./styles/lixeira.svg"
								lixeira.onclick = () =>
								{
									removeMusica(b.uid)
								}
								div.appendChild(lixeira)
				
								$retorno.appendChild(div)							
							})
					}
				}
				else if(encontrado)
				{
					$search.value = ''
				}
				else
				{
					$search.value = ''
				}
			})
	}
}

