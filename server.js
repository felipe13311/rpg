const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static(__dirname));

io.on("connection",(socket)=>{
socket.on("ataque",(dano)=>{
socket.broadcast.emit("receberAtaque",dano);
});
});

http.listen(3000);
