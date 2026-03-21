const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static(__dirname));

io.on("connection", (socket) => {
    console.log("🩸 Novo Agente entrou na Facility...");
    
    socket.on("roll", (data) => {
        socket.broadcast.emit("roll", data);
    });
    
    socket.on("ataque", (dano) => {
        socket.broadcast.emit("receberAtaque", dano);
    });
});

http.listen(3000, () => {
    console.log("🌕 BLOOD MOON VTT RODANDO EM http://localhost:3000");
    console.log("Estilo Ordem Paranormal × Lobotomy Corporation ATIVADO");
});
