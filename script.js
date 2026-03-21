// ===== SOCKET =====
const socket = io();

// ===== NAVEGAÇÃO =====
function abrir(id){
document.querySelectorAll(".tela").forEach(t=>t.classList.remove("ativa"));
document.getElementById(id).classList.add("ativa");
}

// ===== DADOS =====
let agentes = JSON.parse(localStorage.getItem("agentes")) || [];
let agenteAtual = null;

// ===== ROLAGEM =====
function rolarDado(){
let formula = document.getElementById("formulaDado").value.toLowerCase();
let match = formula.match(/(\d+)d(\d+)([+-]\d+)?/);

if(!match) return alert("Use: 1d20+5");

let qtd = +match[1];
let faces = +match[2];
let bonus = +(match[3] || 0);

let total = 0;
let rolls = [];

for(let i=0;i<qtd;i++){
let r = Math.floor(Math.random()*faces)+1;
rolls.push(r);
total += r;
}

total += bonus;

logRolagens.innerHTML += `<p>🎲 ${formula}: [${rolls}] = ${total}</p>`;
socket.emit("ataque", total);
}

socket.on("receberAtaque",(dano)=>{
logRolagens.innerHTML += `<p style="color:orange">🔥 Dano recebido: ${dano}</p>`;
});

// ===== AGENTES =====
function criarAgente(){
let nome = nomeAgente.value;
let classe = classeAgente.value;

if(!nome) return;

agentes.push({nome,classe,ficha:{}});
salvarAgentes();
renderAgentes();
}

function renderAgentes(){
listaAgentes.innerHTML="";

agentes.forEach((a,i)=>{
let li = document.createElement("li");

li.innerHTML = `
${a.nome} (${a.classe})
<button onclick="abrirFicha(${i})">Abrir</button>
`;

listaAgentes.appendChild(li);
});
}

function abrirFicha(i){
agenteAtual = i;
abrir("fichaAgente");

let a = agentes[i];
tituloFicha.innerText = a.nome;

forca.value = a.ficha.forca || "";
agilidade.value = a.ficha.agilidade || "";
intelecto.value = a.ficha.intelecto || "";
vida.value = a.ficha.vida || "";

mostrarFichaAgente();
}

function salvarFichaAgente(){
let a = agentes[agenteAtual];

a.ficha = {
forca: forca.value,
agilidade: agilidade.value,
intelecto: intelecto.value,
vida: vida.value
};

salvarAgentes();
mostrarFichaAgente();
}

function mostrarFichaAgente(){
let a = agentes[agenteAtual];

viewFicha.innerHTML = `
<p>FOR: ${a.ficha.forca}</p>
<p>AGI: ${a.ficha.agilidade}</p>
<p>INT: ${a.ficha.intelecto}</p>
<p>HP: ${a.ficha.vida}</p>
`;
}

function salvarAgentes(){
localStorage.setItem("agentes",JSON.stringify(agentes));
}

// ===== FICHA PLAYER =====
function salvarFicha(){
let ficha = {
nome: nomeFicha.value,
classe: classeFicha.value,
hp: hpFicha.value
};

localStorage.setItem("ficha",JSON.stringify(ficha));
mostrarFicha();
}

function mostrarFicha(){
let f = JSON.parse(localStorage.getItem("ficha"));
if(!f) return;

previewFicha.innerHTML = `
<h3>${f.nome}</h3>
<p>${f.classe}</p>
<p>HP: ${f.hp}</p>
`;
}

// ===== CAMPANHAS =====
let campanhas = JSON.parse(localStorage.getItem("campanhas")) || [];

function criarCampanha(){
campanhas.push({nome:nomeCampanha.value});
localStorage.setItem("campanhas",JSON.stringify(campanhas));
renderCampanhas();
}

function renderCampanhas(){
listaCampanhas.innerHTML="";
campanhas.forEach(c=>{
let li=document.createElement("li");
li.innerText = c.nome;
listaCampanhas.appendChild(li);
});
}

// ===== MAPA =====
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let tokens = [];
let dragging = null;

canvas.addEventListener("click", e=>{
tokens.push({x:e.offsetX,y:e.offsetY});
draw();
});

canvas.addEventListener("mousedown", e=>{
tokens.forEach(t=>{
if(Math.hypot(t.x-e.offsetX,t.y-e.offsetY)<10) dragging=t;
});
});

canvas.addEventListener("mousemove", e=>{
if(dragging){
dragging.x=e.offsetX;
dragging.y=e.offsetY;
draw();
}
});

canvas.addEventListener("mouseup", ()=>dragging=null);

function draw(){
ctx.clearRect(0,0,canvas.width,canvas.height);
tokens.forEach(t=>{
ctx.beginPath();
ctx.arc(t.x,t.y,10,0,Math.PI*2);
ctx.fillStyle="red";
ctx.fill();
});
}

// INIT
renderAgentes();
renderCampanhas();
mostrarFicha();
