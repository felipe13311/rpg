// ===== LOGIN =====
let usuario = localStorage.getItem("user");

function login(){
if(user.value && pass.value){
localStorage.setItem("user",user.value);
usuario=user.value;
ir("dashboard");
}
}

function logout(){
localStorage.clear();
location.reload();
}

// ===== NAVEGAÇÃO =====
function ir(id){
document.querySelectorAll(".pagina").forEach(p=>p.classList.remove("ativa"));
document.getElementById(id).classList.add("ativa");
}

// ===== AGENTES =====
let agentes = JSON.parse(localStorage.getItem("agentes")) || [];

function renderAgentes(){
tabelaAgentes.innerHTML="";

agentes.forEach(a=>{
let tr=document.createElement("tr");
tr.innerHTML=`<td>${a.nome}</td><td>${a.classe}</td><td>${a.role}</td>`;
tabelaAgentes.appendChild(tr);
});
}

// ===== FICHA PRIVADA =====
function salvarFicha(){

let file = gifFicha.files[0];

if(file){
let reader = new FileReader();
reader.onload=()=>{
let ficha={
nome:nomeFicha.value,
classe:classeFicha.value,
hp:hpFicha.value,
img:reader.result
};

localStorage.setItem("ficha_"+usuario,JSON.stringify(ficha));
mostrarFicha();
};
reader.readAsDataURL(file);

}else{

let ficha={
nome:nomeFicha.value,
classe:classeFicha.value,
hp:hpFicha.value
};

localStorage.setItem("ficha_"+usuario,JSON.stringify(ficha));
mostrarFicha();
}
}

function mostrarFicha(){
let f = JSON.parse(localStorage.getItem("ficha_"+usuario));

if(!f) return;

previewFicha.innerHTML=`
<h3>${f.nome}</h3>
<p>${f.classe}</p>
<p>HP: ${f.hp}</p>
<img src="${f.img||''}">
`;
}

// ===== CAMPANHAS =====
let campanhas = JSON.parse(localStorage.getItem("campanhas")) || [];

function criarCampanha(){
let nome = nomeCampanha.value;

campanhas.push({nome,mapa:[]});
salvarCampanhas();
renderCampanhas();
renderTabelaCampanhas();
}

function renderCampanhas(){
listaCampanhas.innerHTML="";

campanhas.forEach((c,i)=>{
let li=document.createElement("li");

li.innerHTML=`
${c.nome}
<button onclick="editarCampanha(${i})">Editar</button>
<button onclick="abrirMapa(${i})">Abrir</button>
`;

listaCampanhas.appendChild(li);
});
}

function renderTabelaCampanhas(){
tabelaCampanhas.innerHTML="";

campanhas.forEach((c,i)=>{
let tr=document.createElement("tr");

tr.innerHTML=`
<td>${c.nome}</td>
<td><button onclick="editarCampanha(${i})">✏️</button></td>
`;

tabelaCampanhas.appendChild(tr);
});
}

function editarCampanha(i){
let novo = prompt("Novo nome:",campanhas[i].nome);
if(novo){
campanhas[i].nome=novo;
salvarCampanhas();
renderCampanhas();
renderTabelaCampanhas();
}
}

function salvarCampanhas(){
localStorage.setItem("campanhas",JSON.stringify(campanhas));
}

// ===== MAPA (OWLBEAR SIMPLES) =====
const canvas=document.getElementById("mapa");
const ctx=canvas.getContext("2d");

let atual=null;

function abrirMapa(i){
atual=i;
ir("owlbear");
desenhar();
}

canvas.addEventListener("click",e=>{
if(atual===null) return;

campanhas[atual].mapa.push({
x:e.offsetX,
y:e.offsetY
});

salvarCampanhas();
desenhar();
});

function desenhar(){
ctx.clearRect(0,0,800,400);

if(atual===null) return;

campanhas[atual].mapa.forEach(t=>{
ctx.fillStyle="red";
ctx.beginPath();
ctx.arc(t.x,t.y,10,0,Math.PI*2);
ctx.fill();
});
}

// ===== INIT =====
renderAgentes();
renderCampanhas();
renderTabelaCampanhas();
mostrarFicha();
