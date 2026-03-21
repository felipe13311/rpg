// ===== NAVEGAÇÃO =====
function mudarPagina(id){
document.querySelectorAll(".pagina").forEach(p=>p.classList.remove("ativa"));
document.getElementById(id).classList.add("ativa");
}

// ===== AGENTES =====
let agentes = JSON.parse(localStorage.getItem("agentes")) || [];

function criarAgente(){
let nome = nomeAgente.value;
let classe = classeAgente.value;
let role = document.getElementById("role").value;

let file = avatarInput.files[0];

if(file){
let reader = new FileReader();
reader.onload = function(){
let agente = {nome,classe,role,avatar:reader.result,hp:20};
agentes.push(agente);
salvarAgentes();
renderAgentes();
}
reader.readAsDataURL(file);
}else{
let agente = {nome,classe,role,hp:20};
agentes.push(agente);
salvarAgentes();
renderAgentes();
}
}

function renderAgentes(){
listaAgentes.innerHTML="";

agentes.forEach((a,i)=>{
let li=document.createElement("li");

li.innerHTML = `
<img src="${a.avatar||''}" width="30">
${a.nome} (${a.classe}) [${a.role}]
<button onclick="editarAgente(${i})">Editar</button>
`;

listaAgentes.appendChild(li);
});
}

function editarAgente(i){
let novoNome = prompt("Novo nome:", agentes[i].nome);
let novoHP = prompt("HP:", agentes[i].hp);

if(novoNome) agentes[i].nome = novoNome;
if(novoHP) agentes[i].hp = +novoHP;

salvarAgentes();
renderAgentes();
}

function salvarAgentes(){
localStorage.setItem("agentes", JSON.stringify(agentes));
}

// ===== CAMPANHAS =====
let campanhas = JSON.parse(localStorage.getItem("campanhas")) || [];
let campanhaAtual=null;

function criarCampanha(){
let nome = nomeCampanha.value;
campanhas.push({nome,mapa:[],chat:[]});
salvarCampanhas();
renderCampanhas();
}

function renderCampanhas(){
listaCampanhas.innerHTML="";

campanhas.forEach((c,i)=>{
let li=document.createElement("li");
li.textContent=c.nome;

li.onclick=()=>{
campanhaAtual=i;
desenhar();
renderChat();
};

listaCampanhas.appendChild(li);
});
}

function salvarCampanhas(){
localStorage.setItem("campanhas",JSON.stringify(campanhas));
}

// ===== MAPA + TOKENS =====
const canvas = document.getElementById("mapa");
const ctx = canvas.getContext("2d");

canvas.addEventListener("click",(e)=>{
if(campanhaAtual===null) return;

let nome = prompt("Nome do token");
let hp = prompt("HP");

campanhas[campanhaAtual].mapa.push({
x:e.offsetX,
y:e.offsetY,
nome,
hp
});

salvarCampanhas();
desenhar();
});

function desenhar(){
ctx.clearRect(0,0,canvas.width,canvas.height);

if(campanhaAtual===null) return;

campanhas[campanhaAtual].mapa.forEach(t=>{
ctx.fillStyle="red";
ctx.beginPath();
ctx.arc(t.x,t.y,10,0,Math.PI*2);
ctx.fill();

ctx.fillText(t.nome+"("+t.hp+")",t.x-10,t.y-15);
});
}

// ===== CHAT =====
function enviarChat(){
if(campanhaAtual===null) return;

let msg = chatInput.value;

campanhas[campanhaAtual].chat.push(msg);
salvarCampanhas();
renderChat();
}

function renderChat(){
chatBox.innerHTML="";

campanhas[campanhaAtual].chat.forEach(m=>{
let p=document.createElement("p");
p.textContent=m;
chatBox.appendChild(p);
});
}

// ===== DADOS =====
function rolarDado(){
let input = diceInput.value;

let match = input.match(/(\d*)d(\d+)([+-]\d+)?/);

if(!match) return;

let qtd = match[1]||1;
let lados = match[2];
let mod = parseInt(match[3])||0;

let total=0;

for(let i=0;i<qtd;i++){
total+=Math.floor(Math.random()*lados)+1;
}

total+=mod;

let li=document.createElement("li");
li.textContent=input+" = "+total;

logDados.appendChild(li);
}

// INIT
renderAgentes();
renderCampanhas();
