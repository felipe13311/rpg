/* Além das Muralhas — ficha local, sem cadastro e sem programação. */
(() => {
  "use strict";

  const STORAGE = "alem-das-muralhas-ficha-v1";
  const ATTRIBUTE_LIST = [
    ["forca", "Força", "Potência, esforço e impacto físico."],
    ["agilidade", "Agilidade", "Movimento fino, mira e deslocamento."],
    ["carisma", "Carisma", "Presença, leitura social e convicção."],
    ["vigor", "Vigor", "Resistência do corpo e recuperação."],
    ["intelecto", "Intelecto", "Raciocínio, atenção e preparo."]
  ];
  const SKILL_GROUPS = [
    { title: "Agilidade", icon: "↗", items: [["reflexo", "Reflexo", "Esquivar de algo específico, especialmente fora de combate."], ["furtividade", "Furtividade", "Se esconder ou passar sem ser visto."], ["acrobacia", "Acrobacia", "Manobras usando o DMT; pode evitar injúrias ou abrir um crítico."], ["pontaria", "Pontaria", "Guiar os ganchos do DMT a pontos específicos."], ["iniciativa", "Iniciativa", "Define sua ordem de ataque."]] },
    { title: "Força", icon: "✦", items: [["perfuracao", "Perfuração", "Ao atingir um titã, tente um golpe definitivo."], ["luta", "Luta", "Confronto contra humanos, não contra titãs."]] },
    { title: "Carisma", icon: "◌", items: [["enganacao", "Enganação", "Mentir, fintar e conduzir pessoas ao erro."], ["diplomacia", "Diplomacia", "Convencer ou acalmar pessoas; quase não funciona em titãs."], ["religiao", "Religião", "Convencer pela fé; crenças opostas podem anular o resultado."]] },
    { title: "Vigor", icon: "▰", items: [["fortitude", "Fortitude", "Aguentar ataques diretos. Mordida de titã ignora Fortitude."], ["desintoxicacao", "Desintoxicação", "Resistir a venenos e comida estragada."]] },
    { title: "Intelecto", icon: "◈", items: [["tatica", "Tática", "Preparar plano de ataque ou evacuação."], ["percepcao", "Percepção", "Notar pontos-chave antes de investigar o ambiente."], ["crime", "Crime / Roubo", "Arquitetar golpes sujos contra humanos."], ["investigacao", "Investigação", "Buscar pistas; contra segredo, a DT vem da Furtividade."], ["medicina", "Medicina", "Estabilizar alguém morrendo e, com dado alto, curar injúrias não permanentes."]] },
    { title: "Múltiplos atributos", icon: "∞", items: [["profissao", "Profissão", "Use o atributo que fizer sentido: força numa forja, carisma numa carta e assim por diante."]] }
  ];
  const SKILL_KEYS = SKILL_GROUPS.flatMap((group) => group.items.map(([key]) => key));
  const fresh = () => ({
    view: "sheet",
    identity: { nome: "", idadeCrianca: "", idadeAdulta: "", altura: "", aniversario: "", nivel: 0, armadura: 0, dmtRoll: null, dmtSpeed: "", anotacoes: "" },
    attributes: Object.fromEntries(ATTRIBUTE_LIST.map(([key]) => [key, 0])),
    skills: Object.fromEntries(SKILL_KEYS.map((key) => [key, 0])),
    tracks: { vida: null, pe: null, sanidade: null }
  });

  let state;
  try { state = { ...fresh(), ...JSON.parse(localStorage.getItem(STORAGE) || "null") }; } catch (_) { state = fresh(); }
  state.identity = { ...fresh().identity, ...state.identity };
  state.attributes = { ...fresh().attributes, ...state.attributes };
  state.skills = { ...fresh().skills, ...state.skills };
  state.tracks = { ...fresh().tracks, ...state.tracks };

  const app = document.querySelector("#app");
  const toastRegion = document.querySelector("#toast-region");
  const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
  const sum = (object) => Object.values(object).reduce((total, value) => total + Number(value || 0), 0);
  const save = () => localStorage.setItem(STORAGE, JSON.stringify(state));
  const toast = (text) => { const item = document.createElement("div"); item.className = "toast"; item.textContent = text; toastRegion.append(item); setTimeout(() => item.remove(), 3300); };
  const titleName = () => state.identity.nome.trim() || "Personagem sem nome";

  function caps() {
    return {
      vida: 10 + Number(state.skills.fortitude || 0) * 2,
      pe: 5 + Math.max(0, Number(state.identity.nivel || 0)),
      sanidade: 4 + Number(state.attributes.intelecto || 0)
    };
  }
  function normalizeTracks(previous = null) {
    const max = caps();
    Object.keys(max).forEach((key) => {
      const current = state.tracks[key];
      if (current === null || current === undefined || Number.isNaN(Number(current))) state.tracks[key] = max[key];
      else if (previous && Number(current) === Number(previous[key])) state.tracks[key] = max[key];
      else state.tracks[key] = Math.max(0, Math.min(Number(current), max[key]));
    });
  }
  normalizeTracks();

  function navButton(view, icon, label) {
    return `<button class="wall-nav ${state.view === view ? "active" : ""}" data-action="view" data-view="${view}"><span>${icon}</span>${label}</button>`;
  }
  function shell(content, crumb) {
    return `<div class="wall-shell"><aside class="wall-sidebar"><button class="wall-brand" data-action="view" data-view="sheet"><span class="wall-brand-mark">A</span><span>ALÉM<small>DAS MURALHAS</small></span></button><p class="wall-overline">Sua ficha</p><nav class="wall-navs">${navButton("sheet", "▤", "Montar personagem")}${navButton("guide", "?", "Como fazer a ficha")}</nav><div class="wall-sidebar-bottom"><span class="save-dot"></span><span>Salva neste navegador</span></div></aside><main class="wall-main"><header class="wall-top"><span>${esc(crumb)}</span><div><button class="wall-top-button" data-action="export">Baixar ficha</button><button class="wall-top-button" data-action="reset">Nova ficha</button></div></header>${content}</main></div>`;
  }
  function statControl(kind, key, value, max, remaining) {
    const disabledDown = value <= 0 ? "disabled" : "";
    const disabledUp = value >= max || remaining <= 0 ? "disabled" : "";
    return `<div class="stepper"><button data-action="step" data-kind="${kind}" data-key="${key}" data-change="-1" ${disabledDown} aria-label="Diminuir">−</button><strong>${value}</strong><button data-action="step" data-kind="${kind}" data-key="${key}" data-change="1" ${disabledUp} aria-label="Aumentar">+</button></div>`;
  }
  function resourceCard(key, title, formula, color) {
    const max = caps()[key];
    const current = Number(state.tracks[key]);
    return `<article class="resource-card" style="--resource:${color}"><div><span>${title}</span><strong>${current}<small> / ${max}</small></strong></div><p>${formula}</p><div class="resource-adjust"><button data-action="track" data-key="${key}" data-change="-1" ${current <= 0 ? "disabled" : ""}>−</button><button data-action="track" data-key="${key}" data-change="1" ${current >= max ? "disabled" : ""}>+</button></div></article>`;
  }
  function textInput(label, key, value, placeholder, extra = "") {
    return `<label class="identity-field ${extra}"><span>${label}</span><input data-bind="identity.${key}" value="${esc(value)}" placeholder="${placeholder}" /></label>`;
  }

  function sheetView() {
    const attributeSpent = sum(state.attributes);
    const skillSpent = sum(state.skills);
    const attributeLeft = 6 - attributeSpent;
    const skillLeft = 11 - skillSpent;
    const max = caps();
    return shell(`<section class="wall-heading"><div><p class="wall-eyebrow">Ficha de personagem · além das muralhas</p><h1>${esc(titleName())}</h1><p>Preencha por partes. Os limites, pontos e contas já estão aqui — você só escolhe quem é seu personagem.</p></div><div class="sheet-state"><span>nível</span><strong>${state.identity.nivel}</strong></div></section><section class="identity-card"><header><div><p class="wall-eyebrow">01 · Quem chega à muralha</p><h2>Identidade</h2></div><span class="rule-mark">/===/</span></header><div class="identity-grid">${textInput("Nome", "nome", state.identity.nome, "Como ele é chamado", "identity-name")}${textInput("Idade (criança)", "idadeCrianca", state.identity.idadeCrianca, "ex.: 12")}${textInput("Idade (adulta)", "idadeAdulta", state.identity.idadeAdulta, "preencha se houver")}${textInput("Altura", "altura", state.identity.altura, "ex.: 1,68 m")}${textInput("Aniversário", "aniversario", state.identity.aniversario, "ex.: 18/05")}<label class="identity-field"><span>Nível</span><input type="number" min="0" data-bind="identity.nivel" value="${state.identity.nivel}" /></label></div><p class="height-note">Idade adulta é opcional: use só quando a campanha citar as duas fases. Modificações de altura ficam a critério da tabela do mestre.</p></section><section class="resources-grid">${resourceCard("vida", "Vida", `10 + Fortitude × 2`, "#ff9474")}${resourceCard("pe", "PE", "5 + Nível", "#e5a75a")}${resourceCard("sanidade", "Sanidade", "4 + Intelecto", "#92d4ee")}</section><section class="points-section"><header class="section-title"><div><p class="wall-eyebrow">02 · Fundamentos</p><h2>Atributos</h2><span>máximo 2 em cada atributo</span></div><div class="point-counter"><strong>${attributeLeft}</strong><span>de 6 pontos livres</span></div></header><div class="attribute-grid">${ATTRIBUTE_LIST.map(([key, label, detail]) => `<article class="attribute-card"><div><span>${label}</span><small>${detail}</small></div>${statControl("attribute", key, state.attributes[key], 2, attributeLeft)}</article>`).join("")}</div></section><section class="defense-layout"><article class="defense-card"><header><p class="wall-eyebrow">03 · Proteção</p><h2>Defesas</h2></header><div class="defense-values"><div><span>Defesa</span><strong>${5 + Number(state.skills.fortitude || 0)}</strong><small>5 + Fortitude</small></div><div><span>Esquiva</span><strong>${5 + Number(state.skills.reflexo || 0)}</strong><small>5 + Reflexo</small></div><div><span>Resistência</span><strong>${Number(state.identity.armadura || 0)}</strong><small>0 + armadura</small></div></div><label class="armor-field"><span>Bônus de armadura</span><input type="number" data-bind="identity.armadura" value="${state.identity.armadura}" /></label></article><article class="dmt-card"><div><p class="wall-eyebrow">Movimento tridimensional</p><h2>Velocidade de DMT</h2><p>Role o d100. O mestre transforma o resultado na velocidade em km/h usando a tabela da mesa.</p></div><div class="dmt-roll"><strong>${state.identity.dmtRoll === null ? "—" : state.identity.dmtRoll}</strong><span>d100</span><button class="wall-primary" data-action="dmt">Rolar DMT</button></div><label class="speed-field"><span>Velocidade definida pelo mestre</span><input data-bind="identity.dmtSpeed" value="${esc(state.identity.dmtSpeed)}" placeholder="ex.: 64 km/h" /></label></article></section><section class="points-section skills-section"><header class="section-title"><div><p class="wall-eyebrow">04 · O que você sabe fazer</p><h2>Perícias</h2><span>máximo 3 em cada perícia</span></div><div class="point-counter"><strong>${skillLeft}</strong><span>de 11 pontos livres</span></div></header><div class="skill-groups">${SKILL_GROUPS.map((group) => `<article class="skill-group"><header><span>${group.icon}</span><h3>${group.title}</h3></header><div>${group.items.map(([key, label, description]) => `<div class="skill-row"><details><summary>${label}<span>?</span></summary><p>${description}</p></details>${statControl("skill", key, state.skills[key], 3, skillLeft)}</div>`).join("")}</div></article>`).join("")}</div></section><section class="notes-card"><header><div><p class="wall-eyebrow">05 · Uma coisa para lembrar</p><h2>Anotações de personagem</h2></div><span>✦</span></header><textarea data-bind="identity.anotacoes" placeholder="Medos, objetivos, nome da divisão, relações, injúrias ou qualquer coisa que o mestre precise lembrar.">${esc(state.identity.anotacoes)}</textarea></section><footer class="wall-footer"><span>Ficha completa: os cálculos acompanham suas escolhas automaticamente.</span><button class="wall-primary" data-action="export">Salvar uma cópia</button></footer>`, "Montar personagem");
  }

  function guideView() {
    return shell(`<section class="wall-heading guide-heading"><div><p class="wall-eyebrow">Sem regra escondida</p><h1>Como fazer sua ficha</h1><p>Você não precisa montar fórmula nenhuma. Faz na ordem abaixo, observa os pontos livres e pronto.</p></div></section><section class="how-grid"><article class="how-card"><span>01</span><h2>Preencha quem é você</h2><p>Nome, altura e aniversário são diretos. Se a história tiver fase de criança e adulta, use os dois campos de idade. O personagem começa no nível 0.</p></article><article class="how-card"><span>02</span><h2>Distribua 6 atributos</h2><p>Força, Agilidade, Carisma, Vigor e Intelecto. Cada um vai até 2. A página mostra quantos pontos ainda sobram e não deixa passar do limite.</p></article><article class="how-card"><span>03</span><h2>Escolha 11 perícias</h2><p>Coloque até 3 em cada perícia. Fortitude aumenta sua Vida; Reflexo aumenta Esquiva; Intelecto aumenta Sanidade. Clique no “?” se quiser lembrar o uso de uma perícia.</p></article><article class="how-card"><span>04</span><h2>Confira o que é automático</h2><p>Vida é 10 + Fortitude × 2. PE é 5 + Nível. Sanidade é 4 + Intelecto. Defesa e Esquiva também se atualizam sozinhas.</p></article><article class="how-card wide"><span>05</span><h2>Role o DMT e comece a sessão</h2><p>O botão de DMT roda um d100. Anote a velocidade em km/h que o mestre definir usando a tabela da campanha. Use Anotações para divisão, objetivos e qualquer detalhe que deixe seu personagem vivo na mesa.</p><button class="wall-primary" data-action="view" data-view="sheet">Montar minha ficha →</button></article></section><section class="example-card"><p class="wall-eyebrow">Exemplo rápido</p><h2>Jackzinho tem 1 em Fortitude, então sua Vida máxima é <em>12</em>.</h2><p>Com Nível 1, seus PE seriam 6. Com 1 de Intelecto, sua Sanidade seria 5. A ficha calcula isso para você enquanto os pontos são distribuídos.</p></section>`, "Como fazer a ficha");
  }

  function render() { app.innerHTML = state.view === "guide" ? guideView() : sheetView(); }

  function updateBound(element) {
    const [group, key] = element.dataset.bind.split(".");
    if (!state[group]) return;
    const oldMax = caps();
    let value = element.value;
    if (["nivel", "armadura"].includes(key)) value = Math.max(0, Number(value || 0));
    state[group][key] = value;
    normalizeTracks(oldMax); save();
    if (key === "nivel" || key === "armadura") render();
  }
  function step(kind, key, change) {
    const collection = kind === "attribute" ? state.attributes : state.skills;
    const budget = kind === "attribute" ? 6 : 11;
    const max = kind === "attribute" ? 2 : 3;
    const oldMax = caps();
    const current = Number(collection[key] || 0);
    if (change > 0 && sum(collection) >= budget) return toast(`Você já usou os ${budget} pontos desta seção.`);
    if (change > 0 && current >= max) return toast(`O máximo em cada ${kind === "attribute" ? "atributo" : "perícia"} é ${max}.`);
    collection[key] = Math.max(0, Math.min(max, current + change));
    normalizeTracks(oldMax); save(); render();
  }
  function adjustTrack(key, change) {
    const max = caps()[key];
    state.tracks[key] = Math.max(0, Math.min(max, Number(state.tracks[key]) + change));
    save(); render();
  }
  function dmt() {
    state.identity.dmtRoll = Math.floor(Math.random() * 100) + 1;
    save(); render(); toast(`DMT: d100 rolou ${state.identity.dmtRoll}. Agora o mestre aplica a tabela.`);
  }
  function reset() {
    if (!confirm("Começar uma ficha nova? A atual ainda pode ser baixada antes, mas será removida deste navegador.")) return;
    state = fresh(); normalizeTracks(); save(); render(); toast("Ficha nova pronta para ser preenchida.");
  }
  function exportSheet() {
    const content = { rpg: "Além das Muralhas", exportadoEm: new Date().toISOString(), personagem: state.identity, atributos: state.attributes, pericias: state.skills, recursos: { atuais: state.tracks, maximos: caps() } };
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob); link.download = `${titleName().toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "ficha"}-alem-das-muralhas.json`;
    document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(link.href);
    toast("Cópia da ficha baixada.");
  }

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]"); if (!target) return;
    const action = target.dataset.action;
    if (action === "view") { state.view = target.dataset.view; save(); render(); window.scrollTo({ top: 0, behavior: "smooth" }); }
    if (action === "step") step(target.dataset.kind, target.dataset.key, Number(target.dataset.change));
    if (action === "track") adjustTrack(target.dataset.key, Number(target.dataset.change));
    if (action === "dmt") dmt();
    if (action === "reset") reset();
    if (action === "export") exportSheet();
  });
  document.addEventListener("input", (event) => { if (event.target.matches("[data-bind]")) updateBound(event.target); });
  document.addEventListener("change", (event) => { if (event.target.matches("[data-bind]")) updateBound(event.target); });
  render();
})();

