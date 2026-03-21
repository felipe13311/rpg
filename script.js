// TROCA DE PÁGINA
function mudarPagina(id){
document.querySelectorAll(".pagina").forEach(p=>p.classList.remove("ativa"));
document.getElementById(id).classList.add("ativa");
}

// 🎲 DADOS CUSTOM
function rolarCustom(){
let input = document.getElementById("customDice").value;

let match = input.match(/(\d*)d(\d+)([+-]\d+)?/);

if(!match){
resultadoDado.innerText="Formato inválido";
return;
}

let qtd = match[1] || 1;
let lados = match[2];
let mod = parseInt(match[3]) || 0;

let total=0;

for(let i=0;i<qtd;i++){
total+=Math.floor(Math.random()*lados)+1;
}

total+=mod;

resultadoDado.innerText="Resultado: "+total;
}

// 🗺️ MAPA (OWLBEAR STYLE)
const canvas = document.getElementById("mapa");
const ctx = canvas.getContext("2d");

let objetos=[];

canvas.addEventListener("click",(e)=>{
let x=e.offsetX;
let y=e.offsetY;

objetos.push({x,y});

desenhar();
});

function desenhar(){
ctx.clearRect(0,0,canvas.width,canvas.height);

objetos.forEach(o=>{
ctx.fillStyle="red";
ctx.beginPath();
ctx.arc(o.x,o.y,10,0,Math.PI*2);
ctx.fill();
});
}

// DRAG (mover tokens)
let selecionado=null;

canvas.addEventListener("mousedown",(e)=>{
objetos.forEach(o=>{
let dist = Math.hypot(o.x-e.offsetX,o.y-e.offsetY);
if(dist<10) selecionado=o;
});
});

canvas.addEventListener("mousemove",(e)=>{
if(selecionado){
selecionado.x=e.offsetX;
selecionado.y=e.offsetY;
desenhar();
}
});

canvas.addEventListener("mouseup",()=>{
selecionado=null;
});
