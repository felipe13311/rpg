const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static(__dirname));

// Health check pro Railway (resolve SIGTERM e "Stopping Container")
app.get('/', (req, res) => {
  res.send('🌕 BLOOD MOON VTT ONLINE - Facility da Ordem ativa!');
});

io.on("connection", (socket) => {
    console.log("🩸 Novo Agente entrou na Facility...");

    socket.on("roll", (data) => {
        socket.broadcast.emit("roll", data);
    });

    socket.on("ataque", (dano) => {
        socket.broadcast.emit("receberAtaque", dano);
    });
});

// Porta dinâmica (já tá certa)
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`🌕 BLOOD MOON VTT ONLINE NA PORTA ${PORT} - Facility da Ordem ativada!`);
});
