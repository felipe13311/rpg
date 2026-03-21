const storageKey = "grimorio-rpg-ficha";
const fichaCampos = [
  "nome",
  "classe",
  "raca",
  "nivel",
  "for",
  "des",
  "con",
  "int",
  "sab",
  "car",
  "arma",
  "armadura",
  "item1",
  "item2",
  "habilidade"
];

const historicoRolagens = [];

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".tab-button").forEach((botao) => {
    botao.addEventListener("click", () => trocarAba(botao.dataset.tabTarget));
  });

  document.querySelectorAll(".die-button").forEach((botao) => {
    botao.addEventListener("click", () => rolar(Number(botao.dataset.lados)));
  });

  document.getElementById("calcularBtn").addEventListener("click", calcular);
  document.getElementById("limparBtn").addEventListener("click", limparFicha);

  fichaCampos.forEach((campoId) => {
    const campo = document.getElementById(campoId);

    campo.addEventListener("input", () => {
      salvarRascunho();
      calcular();
    });
  });

  restaurarRascunho();
  trocarAba("ficha");
  calcular();
});

function trocarAba(aba) {
  document.querySelectorAll(".tab-panel").forEach((painel) => {
    painel.classList.toggle("active", painel.id === aba);
  });

  document.querySelectorAll(".tab-button").forEach((botao) => {
    botao.classList.toggle("active", botao.dataset.tabTarget === aba);
  });
}

function calcular() {
  const nomeOriginal = valorTexto("nome");
  const nome = nomeOriginal || "Aventureiro sem nome";
  const classe = valorTexto("classe") || "Classe indefinida";
  const raca = valorTexto("raca") || "Origem indefinida";
  const nivel = Math.max(1, valorNumero("nivel") || 1);
  const habilidade = valorTexto("habilidade");

  const FOR = valorNumero("for");
  const DES = valorNumero("des");
  const CON = valorNumero("con");
  const INT = valorNumero("int");
  const SAB = valorNumero("sab");
  const CAR = valorNumero("car");

  const arma = valorTexto("arma");
  const armadura = valorTexto("armadura");
  const item1 = valorTexto("item1");
  const item2 = valorTexto("item2");

  const vida = 20 + CON;
  const esforco = 10 + FOR;
  const defesa = 10 + DES;
  const extase = SAB + INT;
  const presenca = 8 + CAR;

  const semDados =
    !nomeOriginal &&
    !valorTexto("classe") &&
    !valorTexto("raca") &&
    !arma &&
    !armadura &&
    !item1 &&
    !item2 &&
    !habilidade &&
    [FOR, DES, CON, INT, SAB, CAR].every((valor) => valor === 0);

  const resultado = document.getElementById("resultado");

  if (semDados) {
    resultado.innerHTML = `
      <div class="empty-state">
        <p class="eyebrow">Aguardando sinais</p>
        <h3>Os status do aventureiro aparecerão aqui.</h3>
        <p>Preencha a ficha para revelar um painel mais vivo e imersivo do personagem.</p>
      </div>
    `;
    return;
  }

  const dominancia = descobrirDominancia({ FOR, DES, CON, INT, SAB, CAR });
  const equipamentos = [arma, armadura, item1, item2].filter(Boolean);

  resultado.innerHTML = `
    <div class="result-shell">
      <div class="identity-row">
        <div>
          <p class="eyebrow">Registro ativo</p>
          <h3>${escapeHtml(nome)}</h3>
          <p class="identity-subtitle">${escapeHtml(classe)} • ${escapeHtml(raca)} • Nível ${nivel}</p>
          <p class="identity-note">${dominancia}</p>
        </div>
        <div class="identity-mark">${escapeHtml(nome.charAt(0).toUpperCase() || "?")}</div>
      </div>

      <div class="stat-grid">
        ${criarCardStatus("Vida", vida)}
        ${criarCardStatus("Esforço", esforco)}
        ${criarCardStatus("Defesa", defesa)}
        ${criarCardStatus("Êxtase", extase)}
        ${criarCardStatus("Presença", presenca)}
      </div>

      <div class="inventory-row">
        <div class="info-block">
          <h4>Equipamentos</h4>
          <div class="tags">${renderizarTags(equipamentos)}</div>
        </div>

        <div class="info-block">
          <h4>Habilidade especial</h4>
          <p>${escapeHtml(habilidade || "Nenhuma habilidade especial registrada até agora.")}</p>
        </div>
      </div>
    </div>
  `;
}

function rolar(lados) {
  const resultado = Math.floor(Math.random() * lados) + 1;
  const mensagem = gerarPressagio(resultado, lados);

  document.querySelectorAll(".die-button").forEach((botao) => {
    botao.classList.toggle("is-active", Number(botao.dataset.lados) === lados);
  });

  const numeroEl = document.getElementById("resultadoDadoNumero");
  numeroEl.textContent = resultado;
  numeroEl.classList.remove("is-rolling");
  void numeroEl.offsetWidth;
  numeroEl.classList.add("is-rolling");

  document.getElementById("resultadoDadoTexto").textContent = mensagem;

  historicoRolagens.unshift({ lados, resultado, mensagem });

  if (historicoRolagens.length > 6) {
    historicoRolagens.pop();
  }

  renderizarHistorico();
}

function limparFicha() {
  fichaCampos.forEach((campoId) => {
    const campo = document.getElementById(campoId);
    campo.value = campoId === "nivel" ? 1 : "";
  });

  localStorage.removeItem(storageKey);
  calcular();
}

function salvarRascunho() {
  const dados = {};

  fichaCampos.forEach((campoId) => {
    dados[campoId] = document.getElementById(campoId).value;
  });

  localStorage.setItem(storageKey, JSON.stringify(dados));
}

function restaurarRascunho() {
  const bruto = localStorage.getItem(storageKey);

  if (!bruto) {
    return;
  }

  try {
    const dados = JSON.parse(bruto);

    fichaCampos.forEach((campoId) => {
      if (dados[campoId] !== undefined) {
        document.getElementById(campoId).value = dados[campoId];
      }
    });
  } catch (erro) {
    localStorage.removeItem(storageKey);
  }
}

function renderizarHistorico() {
  const lista = document.getElementById("historicoDados");

  if (!historicoRolagens.length) {
    lista.innerHTML = `<li class="history-list__empty">Nenhuma rolagem realizada ainda.</li>`;
    return;
  }

  lista.innerHTML = historicoRolagens
    .map(
      (item) => `
        <li class="history-item">
          <span class="history-item__die">d${item.lados}</span>
          <div class="history-item__content">
            <strong>${item.resultado}</strong>
            <p>${escapeHtml(item.mensagem)}</p>
          </div>
        </li>
      `
    )
    .join("");
}

function criarCardStatus(rotulo, valor) {
  return `
    <article class="stat-card">
      <span>${escapeHtml(rotulo)}</span>
      <strong>${valor}</strong>
    </article>
  `;
}

function renderizarTags(itens) {
  if (!itens.length) {
    return `<span class="tag tag--muted">Sem itens cadastrados</span>`;
  }

  return itens
    .map((item) => `<span class="tag">${escapeHtml(item)}</span>`)
    .join("");
}

function gerarPressagio(resultado, lados) {
  if (resultado === lados) {
    return `O d${lados} respondeu com um auge absoluto.`;
  }

  if (lados === 20 && resultado === 1) {
    return "O destino cobrou um preço amargo nesta rolagem.";
  }

  if (resultado >= Math.ceil(lados * 0.75)) {
    return `Um forte sinal atravessa a névoa no d${lados}.`;
  }

  if (resultado <= Math.max(2, Math.floor(lados * 0.25))) {
    return `A sorte vacila, mas a jornada segue após o d${lados}.`;
  }

  return `O d${lados} mantém o destino em equilíbrio instável.`;
}

function descobrirDominancia(atributos) {
  const descricoes = {
    FOR: "A presença marcial se destaca e sugere confronto direto.",
    DES: "Os movimentos parecem leves, precisos e difíceis de prever.",
    CON: "A resistência domina a ficha e sustenta jornadas mais duras.",
    INT: "A mente estratégica conduz cada decisão importante.",
    SAB: "A leitura do mundo e dos sinais fala mais alto que a pressa.",
    CAR: "O magnetismo pessoal molda o rumo das interações."
  };

  const pares = Object.entries(atributos);
  const [sigla, valor] = pares.reduce((maior, atual) => {
    if (atual[1] > maior[1]) {
      return atual;
    }

    return maior;
  }, ["FOR", atributos.FOR]);

  if (pares.every(([, atributo]) => atributo === 0)) {
    return "Os atributos ainda não revelaram a verdadeira natureza do personagem.";
  }

  return `Traço dominante: ${sigla} ${valor}. ${descricoes[sigla]}`;
}

function valorTexto(id) {
  return document.getElementById(id).value.trim();
}

function valorNumero(id) {
  return Number(document.getElementById(id).value) || 0;
}

function escapeHtml(valor) {
  return String(valor).replace(/[&<>"']/g, (caractere) => {
    const mapa = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return mapa[caractere];
  });
}

window.trocarAba = trocarAba;
window.calcular = calcular;
window.rolar = rolar;
