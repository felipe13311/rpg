let usuarioAtual = localStorage.getItem("user");

// ===== LOGIN =====
function login(){
let u = user.value;
let p = pass.value;

if(u && p){
localStorage.setItem("user",u);
usuarioAtual = u;
mudarPagina("agentes");
}
}

function logout(){
localStorage.removeItem("user");
location.reload();
}

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
let role = role.value;

let file = avatarInput.files[0];

if(file){
let reader = new FileReader();
reader.onload = ()=>{
agentes.push({nome,classe,role,avatar:reader.result,hp:20});
salvarAgentes(); renderAgentes();
}
reader.readAsDataURL(file);
}else{
agentes.push({nome,classe,role,hp:20});
salvarAgentes(); renderAgentes();
}
}

function renderAgentes(){
listaAgentes.innerHTML="";
agentes.forEach((a,i)=>{
let li=document.createElement("li");
li.innerHTML=`${a.nome} (${a.role}) <button onclick="editarAgente(${i})">Editar</button>`;
listaAgentes.appendChild(li);
});
}

function editarAgente(i){
let hp = prompt("HP:", agentes[i].hp);
if(hp) agentes[i].hp = +hp;
salvarAgentes(); renderAgentes();
}

function salvarAgentes(){
localStorage.setItem("agentes",JSON.stringify(agentes));
}

// ===== CAMPANHAS =====
let campanhas = JSON.parse(localStorage.getItem("campanhas")) || [];
let atual = null;

function criarCampanha(){
campanhas.push({nome:nomeCampanha.value,mapa:[],chat:[],turno:0});
salvarCampanhas(); renderCampanhas();
}

function renderCampanhas(){
listaCampanhas.innerHTML="";
campanhas.forEach((c,i)=>{
let li=document.createElement("li");
li.textContent=c.nome;
li.onclick=()=>{atual=i;desenhar();renderChat();}
listaCampanhas.appendChild(li);
});
}

function salvarCampanhas(){
localStorage.setItem("campanhas",JSON.stringify(campanhas));
}

// ===== MAPA + IMAGEM =====
const canvas = document.getElementById("mapa");
const ctx = canvas.getContext("2d");
let bg = null;

mapUpload.addEventListener("change", e=>{
let file = e.target.files[0];
let reader = new FileReader();

reader.onload = ()=>{
bg = new Image();
bg.src = reader.result;
bg.onload = desenhar;
}

reader.readAsDataURL(file);
});

// ===== TOKENS DRAG =====
let selected=null;

canvas.addEventListener("mousedown", e=>{
let x=e.offsetX,y=e.offsetY;

campanhas[atual]?.mapa.forEach(t=>{
if(Math.hypot(t.x-x,t.y-y)<10){
selected=t;
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

// CLICK CRIAR TOKEN
canvas.addEventListener("dblclick", e=>{
let nome=prompt("Nome");
let hp=prompt("HP");

campanhas[atual].mapa.push({x:e.offsetX,y:e.offsetY,nome,hp});
salvarCampanhas();
desenhar();
});

function desenhar(){
ctx.clearRect(0,0,800,400);

if(bg) ctx.drawImage(bg,0,0,800,400);

if(atual===null) return;

campanhas[atual].mapa.forEach(t=>{
ctx.fillStyle="red";
ctx.beginPath();
ctx.arc(t.x,t.y,10,0,Math.PI*2);
ctx.fill();

ctx.fillText(t.nome+"("+t.hp+")",t.x-10,t.y-15);
});
}

// ===== CHAT =====
function enviarChat(){
let msg = `[${new Date().toLocaleTimeString()}] ${usuarioAtual}: ${chatInput.value}`;
campanhas[atual].chat.push(msg);
salvarCampanhas(); renderChat();
}

function renderChat(){
chatBox.innerHTML="";
campanhas[atual].chat.forEach(m=>{
let p=document.createElement("p");
p.textContent=m;
chatBox.appendChild(p);
});
}

// ===== DADOS =====
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

let log=`${usuarioAtual}: ${input} = ${total}`;
let li=document.createElement("li");
li.textContent=log;
logDados.appendChild(li);
}

// ===== TURNOS =====
function iniciarTurno(){
if(atual===null) return;

let ordem = campanhas[atual].mapa;
let turno = campanhas[atual].turno % ordem.length;

turnoAtual.innerText="Turno de: "+ordem[turno].nome;

campanhas[atual].turno++;
salvarCampanhas();
}

// INIT
renderAgentes();
renderCampanhas();
