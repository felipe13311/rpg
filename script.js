function trocarAba(aba) {
  document.querySelectorAll(".aba").forEach(el => el.classList.remove("ativa"));
  document.getElementById(aba).classList.add("ativa");
}

function calcular() {
  let FOR = Number(document.getElementById("for").value);
  let DES = Number(document.getElementById("des").value);
  let CON = Number(document.getElementById("con").value);
  let INT = Number(document.getElementById("int").value);
  let SAB = Number(document.getElementById("sab").value);

  let vida = 20 + CON;
  let esforco = 10 + FOR;
  let defesa = 10 + DES;
  let exs = SAB + INT;

  document.getElementById("resultado").innerHTML = `
    <p>Vida: ${vida}</p>
    <p>Esforço: ${esforco}</p>
    <p>Defesa: ${defesa}</p>
    <p>Êxtase: ${exs}</p>
  `;
}

function rolar(lados) {
  let resultado = Math.floor(Math.random() * lados) + 1;
  document.getElementById("resultadoDado").innerText = `Resultado: ${resultado}`;
}
