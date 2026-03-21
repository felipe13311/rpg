// ===== NAVEGAÇÃO =====
function abrir(id){
document.querySelectorAll(".tela").forEach(t=>t.classList.remove("ativa"));
document.getElementById(id).classList.add("ativa");
}

// ===== AGENTES =====
let agentes = JSON.parse(localStorage.getItem("agentes")) || [];

function renderAgentes(){
let tabela = document.getElementById("tabelaAgentes");
tabela.innerHTML="";

agentes.forEach(a=>{
let tr=document.createElement("tr");
tr.innerHTML=`<td>${a.nome}</td><td>${a.classe}</td><td>${a.role}</td>`;
tabela.appendChild(tr);
});
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
<button onclick="editarCampanha(${i})">✏️</button>
`;

listaCampanhas.appendChild(li);
});
}

function renderTabelaCampanhas(){
tabelaCampanhas.innerHTML="";

campanhas.forEach((c,i)=>{
let tr=document.createElement("tr");
tr.innerHTML=`<td>${c.nome}</td><td><button onclick="editarCampanha(${i})">Editar</button></td>`;
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

// ===== FICHA =====
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

localStorage.setItem("ficha",JSON.stringify(ficha));
mostrarFicha();
};

reader.readAsDataURL(file);

}else{
let ficha={
nome:nomeFicha.value,
classe:classeFicha.value,
hp:hpFicha.value
};

localStorage.setItem("ficha",JSON.stringify(ficha));
mostrarFicha();
}
}

function mostrarFicha(){
let f = JSON.parse(localStorage.getItem("ficha"));

if(!f) return;

previewFicha.innerHTML=`
<h3>${f.nome}</h3>
<p>${f.classe}</p>
<p>HP: ${f.hp}</p>
<img src="${f.img||''}">
`;
}

// ===== MAPA =====
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.addEventListener("click", e=>{
ctx.fillStyle="red";
ctx.beginPath();
ctx.arc(e.offsetX,e.offsetY,10,0,Math.PI*2);
ctx.fill();
});

// INIT
renderAgentes();
renderCampanhas();
renderTabelaCampanhas();
mostrarFicha();
