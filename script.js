document.addEventListener("DOMContentLoaded", () => {

window.trocarAba = function(id){
  document.querySelectorAll(".aba").forEach(e=>e.classList.remove("ativa"));
  document.getElementById(id).classList.add("ativa");
}

window.calcular = function(){
  let FOR = +document.getElementById("for").value;
  let AGI = +document.getElementById("agi").value;
  let VIG = +document.getElementById("vig").value;

  let vida = 10 + VIG;
  let defesa = 10 + AGI;

  document.getElementById("stats").innerHTML =
    `Vida: ${vida} <br> Defesa: ${defesa}`;
}

window.rolar = function(l){
  let r = Math.floor(Math.random()*l)+1;
  document.getElementById("resultadoDado").innerText = r;
}

window.novoAtaque = function(){
  let dano = Math.floor(Math.random()*10)+1;
  let log = document.getElementById("log");

  log.innerHTML += `Ataque causou ${dano}<br>`;
  log.scrollTop = log.scrollHeight;
}

window.usarDroga = function(tipo){
  let efeito = "";

  if(tipo==="hemorred") efeito="+Êxtase";
  if(tipo==="carmine") efeito="Alucinação";

  alert(efeito);
}

});
