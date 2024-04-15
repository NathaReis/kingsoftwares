console.log("L")
const vibrate = () => {
console.log("K")
    // Verifica se a API de vibração é suportada no navegador
    if ("vibrate" in navigator) {
        // Vibra o dispositivo por 1000 milissegundos
        navigator.vibrate(2000);
    } else {
        // Navegador não suporta a API de vibração
        console.log("API de vibração não suportada");
    }
}