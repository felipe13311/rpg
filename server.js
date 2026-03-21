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
});

// 🔥 LINHA OBRIGATÓRIA PRO RAILWAY
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`🌕 BLOOD MOON VTT ONLINE NA PORTA ${PORT} - Facility da Ordem ativada!`);
});
