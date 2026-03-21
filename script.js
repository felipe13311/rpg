const socket = io();

let itens=[];
let exsAtual=50;
let corrupcao=0;

function trocarAba(id){
document.querySelectorAll(".aba").forEach(e=>e.classList.remove("ativa"));
document.getElementById(id).classList.add("ativa");
}

function calcular(){
let FOR=+for.value;
let DES=+des.value;
let CON=+con.value;
let INT=+int.value;
let SAB=+sab.value;

let arm=+armadura.value;

if(arm==4) DES-=2;
if(arm==6) DES-=4;

let vida=20+CON;
let esforco=10+FOR;
let defesa=10+DES+arm;
let exs=SAB+INT;

exsAtual=exs;

atualizarBarra();

resultado.innerHTML=`Vida:${vida} | Esforço:${esforco} | Defesa:${defesa}`;
}

function atualizarBarra(){
barraExs.style.width=exsAtual+"%";
}

function rolar(l){
resultadoDado.innerText=Math.floor(Math.random()*l)+1;
}

function usarDroga(tipo){

if(tipo=="hemorred"){
exsAtual+=10;
corrupcao+=5;
efeitos.innerText="+Êxtase / risco leve";
}

if(tipo=="carmine"){
exsAtual+=15;
corrupcao+=10;
efeitos.innerText="Alucinação / penalidade mental";
}

if(tipo=="pulse"){
exsAtual=100;
corrupcao+=20;
efeitos.innerText="Força máxima / colapso depois";
}

verificarCorrupcao();
atualizarBarra();
}

function verificarCorrupcao(){
if(corrupcao>=100){
alert("COLAPSO TOTAL");
}
}

function addItem(nome){
itens.push(nome);
let li=document.createElement("li");
li.textContent=nome;
listaItens.appendChild(li);
}

function salvarFicha(){
let ficha={
nome:nome.value,
classe:classe.value,
nivel:nivel.value,
exs:exsAtual
};
localStorage.setItem("ficha",JSON.stringify(ficha));
}

function carregarFicha(){
let data=JSON.parse(localStorage.getItem("ficha"));
if(data){
nome.value=data.nome;
classe.value=data.classe;
nivel.value=data.nivel;
exsAtual=data.exs;
atualizarBarra();
}
}
window.onload=carregarFicha;

function iniciarCombate(){

let hpP=+hpPlayer.value;
let atkP=+atkPlayer.value;
let hpE=+hpEnemy.value;
let atkE=+atkEnemy.value;

let log="";

while(hpP>0 && hpE>0){

let critP=Math.random()<0.2?2:1;
let critE=Math.random()<0.2?2:1;

hpE-=atkP*critP;
log+=`Você causou ${atkP*critP}<br>`;

if(hpE<=0)break;

hpP-=atkE*critE;
log+=`Inimigo causou ${atkE*critE}<br>`;
}

log+=hpP>0?"<br>Vitória":"<br>Derrota";

logCombate.innerHTML=log;

socket.emit("ataque",atkP);
}

socket.on("receberAtaque",(dano)=>{
alert("Você recebeu "+dano);
});

function abrirADM(){
let s=prompt("senha");
if(s=="admin123"){
trocarAba("criaturas");
carregarCriaturas();
}
}

function carregarCriaturas(){
let criaturas=["Nothing There","One Sin","Blue Star","White Night"];
listaCriaturas.innerHTML="";
criaturas.forEach(c=>{
let li=document.createElement("li");
li.textContent=c;
listaCriaturas.appendChild(li);
});
}

let anomalias=[
{nome:"Nothing There",risco:90,efeito:()=>corrupcao+=30},
{nome:"One Sin",risco:10,efeito:()=>exsAtual+=5}
];

function interagirAnomalia(){
let a=anomalias[Math.floor(Math.random()*anomalias.length)];
if(Math.random()*100<a.risco){
a.efeito();
alert("Falha com "+a.nome);
}else{
alert("Sucesso com "+a.nome);
}
atualizarBarra();
}
