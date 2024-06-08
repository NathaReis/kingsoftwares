const express = require('express')
const path = require('path');
const app = express()
const port = 3000

// Para usar arquivos estáticos como o style.css e o script.js
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

app.listen(port, () => console.log(`http://localhost:${port}`))