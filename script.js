// ===== FIREBASE BASE (CONFIGURE DEPOIS) =====
const firebaseConfig = {
  apiKey: "SUA_KEY",
  authDomain: "SEU_APP.firebaseapp.com",
  projectId: "SEU_APP"
};

// ===== USUÁRIO =====
let usuarioAtual = localStorage.getItem("user");

// ===== AGENTES =====
let agentes = JSON.parse(localStorage.getItem("agentes")) || [];

// ===== CAMPANHAS =====
let campanhas = JSON.parse(localStorage.getItem("campanhas")) || [];
let atual = null;

// ===== MAPA =====
const canvas = document.getElementById("mapa");
const ctx = canvas.getContext("2d");

let selected = null;

// ===== INICIATIVA =====
function rolarIniciativa(){
let ordem = campanhas[atual].mapa;

ordem.forEach(t=>{
let agi = t.agi || 0;
t.iniciativa = Math.floor(Math.random()*20)+1 + agi;
});

ordem.sort((a,b)=>b.iniciativa-a.iniciativa);

campanhas[atual].turno = 0;
salvarCampanhas();

alert("Iniciativa rolada!");
}

// ===== TURNOS =====
function proximoTurno(){
let lista = campanhas[atual].mapa;

if(lista.length===0) return;

campanhas[atual].turno++;
let turno = campanhas[atual].turno % lista.length;

turnoAtual.innerText = "Turno: "+lista[turno].nome;
}

// ===== TOKENS =====
canvas.addEventListener("dblclick", e=>{
let nome = prompt("Nome");
let hp = 20;
let agi = parseInt(prompt("AGI")) || 0;

campanhas[atual].mapa.push({
x:e.offsetX,
y:e.offsetY,
nome,
hp,
maxHp:hp,
agi,
status:[],
owner:usuarioAtual
});

salvarCampanhas();
desenhar();
});

// ===== DRAG COM PERMISSÃO =====
canvas.addEventListener("mousedown", e=>{
let x=e.offsetX,y=e.offsetY;

campanhas[atual]?.mapa.forEach(t=>{
if(Math.hypot(t.x-x,t.y-y)<10){

// PERMISSÃO
if(t.owner === usuarioAtual || isMestre()){
selected=t;
}

}
});
});

canvas.addEventListener("mousemove", e=>{
if(selected){
selected.x=e.offsetX;
selected.y=e.offsetY;
desenhar();
}
});

canvas.addEventListener("mouseup", ()=>selected=null);

// ===== STATUS =====
function aplicarStatus(token, tipo){
token.status.push(tipo);
}

// ===== DESENHO =====
function desenhar(){
ctx.clearRect(0,0,800,400);

if(atual===null) return;

campanhas[atual].mapa.forEach(t=>{

// TOKEN
ctx.fillStyle="red";
ctx.beginPath();
ctx.arc(t.x,t.y,10,0,Math.PI*2);
ctx.fill();

// NOME
ctx.fillStyle="white";
ctx.fillText(t.nome,t.x-15,t.y-20);

// HP BAR
let largura = 30;
let hpPercent = t.hp/t.maxHp;

ctx.fillStyle="black";
ctx.fillRect(t.x-15,t.y-15,largura,5);

ctx.fillStyle="lime";
ctx.fillRect(t.x-15,t.y-15,largura*hpPercent,5);

// STATUS
ctx.fillStyle="yellow";
ctx.fillText(t.status.join(","),t.x-20,t.y+20);

});
}

// ===== PERMISSÃO =====
function isMestre(){
return agentes.find(a=>a.nome===usuarioAtual)?.role === "mestre";
}

// ===== CHAT MELHORADO =====
function enviarChat(){
let msg = {
user:usuarioAtual,
texto:chatInput.value,
hora:new Date().toLocaleTimeString()
};

campanhas[atual].chat.push(msg);
salvarCampanhas();
renderChat();
}

function renderChat(){
chatBox.innerHTML="";

campanhas[atual].chat.forEach(m=>{
let p=document.createElement("p");
p.innerHTML = `<b>${m.user}</b> [${m.hora}]: ${m.texto}`;
chatBox.appendChild(p);
});
}

// ===== DADOS LOG =====
function rolarDado(){
let input=diceInput.value;
let match=input.match(/(\d*)d(\d+)([+-]\d+)?/);

if(!match) return;

let qtd=match[1]||1;
let lados=match[2];
let mod=parseInt(match[3])||0;

let total=0;

for(let i=0;i<qtd;i++){
total+=Math.floor(Math.random()*lados)+1;
}

total+=mod;

let log = `${usuarioAtual} rolou ${input} = ${total}`;

let li=document.createElement("li");
li.textContent=log;
logDados.appendChild(li);
}
