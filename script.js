let vida=100;
let san=100;
let esforco=100;

let pericias=[
"Acrobacia","Furtividade","Luta","Pontaria",
"Investigação","Ocultismo","Medicina","Diplomacia"
];

let ataques=[];
let status=[];

// PERÍCIAS
function carregarPericias(){
let ul=document.getElementById("listaPericias");

pericias.forEach(p=>{
let li=document.createElement("li");
li.textContent=p+" (0)";
ul.appendChild(li);
});
}

// BARRAS
function atualizarBarras(){
vidaBar.style.width=vida+"%";
sanBar.style.width=san+"%";
esfBar.style.width=esforco+"%";
}

// ATAQUES
function criarAtaque(){
let nome=document.getElementById("nomeAtk").value;
let dano=document.getElementById("danoAtk").value;
let custo=document.getElementById("custoAtk").value;

let atk={nome,dano,custo};
ataques.push(atk);

let li=document.createElement("li");
li.textContent=`${nome} | ${dano} dano | ${custo} custo`;
li.onclick=()=>usarAtaque(atk);

document.getElementById("listaAtaques").appendChild(li);
}

function usarAtaque(atk){
esforco-=atk.custo;
vida-=Math.random()*5;

adicionarStatus("Sangramento");

atualizarBarras();
}

// STATUS
function adicionarStatus(s){
status.push(s);

let li=document.createElement("li");
li.textContent=s;

document.getElementById("statusLista").appendChild(li);
}

// EVENTOS
setInterval(()=>{
if(status.includes("Sangramento")){
vida-=1;
}

if(status.includes("Medo")){
san-=1;
}

if(status.includes("Insanidade")){
san-=2;
}

atualizarBarras();
},1000);

// INIT
carregarPericias();
atualizarBarras();
