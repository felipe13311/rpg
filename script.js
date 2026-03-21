// ================================
// INIT
// ================================

const socket = io();

const telas = document.querySelectorAll(".tela");
const log = document.getElementById("log");

// ================================
// NAVEGAÇÃO
// ================================

document.querySelectorAll("[data-go]").forEach(btn=>{
btn.addEventListener("click",()=>{
let id = btn.getAttribute("data-go");

telas.forEach(t=>t.classList.remove("ativa"));
document.getElementById(id).classList.add("ativa");
});
});

// ================================
// SISTEMA DE DADOS (REAL)
// ================================

function rolar(expressao){

let match = expressao.match(/(\d+)d(\d+)([+-]\d+)?/);

if(!match) return "Erro";

let qtd = parseInt(match[1]);
let faces = parseInt(match[2]);
let bonus = parseInt(match[3] || 0);

let total = 0;
let rolls = [];

for(let i=0;i<qtd;i++){
let r = Math.floor(Math.random()*faces)+1;
rolls.push(r);
total += r;
}

total += bonus;

return {total,rolls,bonus};
}

// botão rolar
document.getElementById("btnRolar").addEventListener("click",()=>{
let exp = document.getElementById("inputDado").value;

let r = rolar(exp);

if(r==="Erro") return alert("Formato inválido");

log.innerHTML += `<p>🎲 ${exp} → ${r.rolls} = ${r.total}</p>`;

socket.emit("roll",r.total);
});

// multiplayer
socket.on("roll",(v)=>{
log.innerHTML += `<p style="color:orange">Outro jogador: ${v}</p>`;
});

// ================================
// AGENTES
// ================================

let agentes = JSON.parse(localStorage.getItem("agentes")) || [];
let atual = null;

const lista = document.getElementById("listaAgentes");

function salvar(){
localStorage.setItem("agentes",JSON.stringify(agentes));
}

function render(){
lista.innerHTML="";

agentes.forEach((a,i)=>{
let li = document.createElement("li");

li.innerHTML = `
${a.nome} (${a.classe})
<button data-open="${i}">Abrir</button>
`;

lista.appendChild(li);
});

// abrir ficha
document.querySelectorAll("[data-open]").forEach(btn=>{
btn.onclick = ()=>{
abrirFicha(btn.dataset.open);
};
});
}

document.getElementById("btnCriarAgente").onclick=()=>{
let nome = document.getElementById("nomeAgente").value;
let classe = document.getElementById("classeAgente").value;

agentes.push({
nome,
classe,
ficha:{forca:0,agi:0,int:0,pre:0,inv:[]}
});

salvar();
render();
};

// ================================
// FICHA COMPLETA
// ================================

function abrirFicha(i){
atual = i;

let a = agentes[i];

document.getElementById("tituloFicha").innerText = a.nome;

// preencher
["forca","agi","int","pre"].forEach(k=>{
document.getElementById(k).value = a.ficha[k];
});

renderInv();
calc();

document.querySelector('[data-go="ficha"]').click();
}

// ================================
// CALCULOS AUTOMATICOS
// ================================

function calc(){

let f = +forca.value;
let a = +agi.value;
let i = +int.value;
let p = +pre.value;

let vida = 20 + f*5;
let pe = 10 + p*5;

hp.innerText = "HP: "+vida;
pe.innerText = "PE: "+pe;
}

// atualizar em tempo real
["forca","agi","int","pre"].forEach(id=>{
document.getElementById(id).addEventListener("input",calc);
});

// ================================
// INVENTARIO
// ================================

function renderInv(){

let a = agentes[atual];

inv.innerHTML="";

a.ficha.inv.forEach((item,i)=>{
let li = document.createElement("li");
li.innerHTML = `${item} <button data-del="${i}">X</button>`;
inv.appendChild(li);
});

document.querySelectorAll("[data-del]").forEach(btn=>{
btn.onclick=()=>{
agentes[atual].ficha.inv.splice(btn.dataset.del,1);
renderInv();
salvar();
};
});
}

document.getElementById("addItem").onclick=()=>{
let item = document.getElementById("item").value;

agentes[atual].ficha.inv.push(item);

renderInv();
salvar();
};

// ================================
// SALVAR FICHA
// ================================

document.getElementById("salvarFicha").onclick=()=>{

let a = agentes[atual];

a.ficha.forca = +forca.value;
a.ficha.agi = +agi.value;
a.ficha.int = +int.value;
a.ficha.pre = +pre.value;

salvar();
alert("Salvo!");
};

// ================================
// MAPA (OWLBEAR STYLE)
// ================================

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let tokens = [];
let dragging = null;
let scale = 1;

canvas.addEventListener("click",e=>{
tokens.push({x:e.offsetX,y:e.offsetY});
draw();
});

canvas.addEventListener("mousedown",e=>{
tokens.forEach(t=>{
if(Math.hypot(t.x-e.offsetX,t.y-e.offsetY)<10){
dragging = t;
}
});
});

canvas.addEventListener("mousemove",e=>{
if(dragging){
dragging.x = e.offsetX;
dragging.y = e.offsetY;
draw();
}
});

canvas.addEventListener("mouseup",()=>dragging=null);

canvas.addEventListener("wheel",e=>{
scale += e.deltaY * -0.001;
scale = Math.max(0.5,Math.min(2,scale));
draw();
});

function draw(){

ctx.setTransform(scale,0,0,scale,0,0);
ctx.clearRect(0,0,canvas.width,canvas.height);

// grid
for(let x=0;x<800;x+=50){
ctx.beginPath();
ctx.moveTo(x,0);
ctx.lineTo(x,500);
ctx.stroke();
}

for(let y=0;y<500;y+=50){
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

// ================================
// INIT
// ================================

render();
