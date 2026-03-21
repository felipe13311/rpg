const socket = io();

function abrir(id){
document.querySelectorAll(".tela").forEach(t=>t.classList.remove("ativa"));
document.getElementById(id).classList.add("ativa");
}

// ===== DADOS =====
let agentes = JSON.parse(localStorage.getItem("agentes")) || [];
let agenteAtual = null;

// ===== ROLAGEM =====
function rolarDado(){
let f = formulaDado.value.toLowerCase();
let m = f.match(/(\d+)d(\d+)([+-]\d+)?/);

if(!m) return alert("Use 1d20+5");

let total=0;
for(let i=0;i<m[1];i++) total+=Math.floor(Math.random()*m[2])+1;
total += +(m[3]||0);

logRolagens.innerHTML += `<p>🎲 ${f} = ${total}</p>`;
socket.emit("ataque", total);
}

socket.on("receberAtaque",d=>{
logRolagens.innerHTML += `<p style="color:red">🔥 ${d} dano</p>`;
});

// ===== AGENTES =====
function criarAgente(){
agentes.push({nome:nomeAgente.value,classe:classeAgente.value,full:{inventario:[]}});
salvarAgentes();
renderAgentes();
}

function renderAgentes(){
listaAgentes.innerHTML="";
agentes.forEach((a,i)=>{
listaAgentes.innerHTML+=`
<li>${a.nome} (${a.classe})
<button onclick="abrirFicha(${i})">Ficha</button>
</li>`;
});
}

function abrirFicha(i){
agenteAtual=i;
abrir("agenteFull");

let a=agentes[i];
nomeAgenteFull.innerText=a.nome;

forcaFull.value=a.full.forca||0;
agiFull.value=a.full.agi||0;
intFull.value=a.full.int||0;
preFull.value=a.full.pre||0;

renderItens();
calcularTudo();
}

// ===== CALCULOS AUTOMATICOS =====
function calcularTudo(){
let forca=+forcaFull.value||0;
let agi=+agiFull.value||0;
let int=+intFull.value||0;
let pre=+preFull.value||0;

// derivados estilo ordem
let vida = 20 + forca*5;
let pe = 10 + pre*5;

// pericias automáticas
lutaCalc.innerText = forca;
pontariaCalc.innerText = agi;
furtividadeCalc.innerText = agi;
percepcaoCalc.innerText = int;

// mostrar
vidaCalc.innerText = "HP: "+vida;
peCalc.innerText = "PE: "+pe;
}

// recalcular ao digitar
["forcaFull","agiFull","intFull","preFull"].forEach(id=>{
document.getElementById(id).addEventListener("input",calcularTudo);
});

// ===== TESTES =====
function teste(tipo){
let val = +document.getElementById(tipo+"Full").value||0;
let roll = Math.floor(Math.random()*20)+1;
let total = roll+val;

logRolagens.innerHTML += `<p>🎲 ${tipo} = ${total}</p>`;
}

// ===== INVENTARIO =====
function addItem(){
let a=agentes[agenteAtual];
a.full.inventario.push(itemNome.value);
itemNome.value="";
renderItens();
salvarAgentes();
}

function renderItens(){
let a=agentes[agenteAtual];
listaItens.innerHTML="";
a.full.inventario.forEach((it,i)=>{
listaItens.innerHTML+=`<li>${it}</li>`;
});
}

// ===== SALVAR =====
function salvarAgenteFull(){
let a=agentes[agenteAtual];

a.full={
forca:+forcaFull.value,
agi:+agiFull.value,
int:+intFull.value,
pre:+preFull.value,
inventario:a.full.inventario
};

salvarAgentes();
alert("Salvo");
}

function salvarAgentes(){
localStorage.setItem("agentes",JSON.stringify(agentes));
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
listaCampanhas.innerHTML+=`<li>${c.nome}</li>`;
});
}

// ===== MAPA (OWLBEAR STYLE) =====
const canvas=document.getElementById("canvas");
const ctx=canvas.getContext("2d");

let tokens=[];
let scale=1,offsetX=0,offsetY=0;

canvas.onclick=e=>{
tokens.push({x:e.offsetX,y:e.offsetY});
draw();
};

canvas.onwheel=e=>{
scale+=e.deltaY*-0.001;
draw();
};

function draw(){
ctx.setTransform(scale,0,0,scale,offsetX,offsetY);
ctx.clearRect(0,0,canvas.width,canvas.height);

// grid
for(let x=0;x<800;x+=50){
ctx.beginPath();
ctx.moveTo(x,0);
ctx.lineTo(x,400);
ctx.stroke();
}

for(let y=0;y<400;y+=50){
ctx.beginPath();
ctx.moveTo(0,y);
ctx.lineTo(800,y);
ctx.stroke();
}

// tokens
tokens.forEach(t=>{
ctx.beginPath();
ctx.arc(t.x,t.y,10,0,Math.PI*2);
ctx.fill();
});
}

// mapa imagem
let img=new Image();

function carregarMapa(){
let url=prompt("URL do mapa:");
if(!url)return;

img.src=url;
img.onload=()=>ctx.drawImage(img,0,0,800,400);
}

// INIT
renderAgentes();
renderCampanhas();
