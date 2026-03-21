const socket = io();
const telas = document.querySelectorAll(".tela");

// ==================== ELEMENTOS ====================
const log = document.getElementById("log");
const inputDado = document.getElementById("inputDado");
const btnRolar = document.getElementById("btnRolar");

const nomeAgenteEl = document.getElementById("nomeAgente");
const classeAgenteEl = document.getElementById("classeAgente");
const btnCriarAgente = document.getElementById("btnCriarAgente");
const listaAgentes = document.getElementById("listaAgentes");

const tituloFicha = document.getElementById("tituloFicha");
const forcaInput = document.getElementById("forca");
const agiInput = document.getElementById("agi");
const intInput = document.getElementById("int");
const preInput = document.getElementById("pre");
const hpEl = document.getElementById("hp");
const peEl = document.getElementById("pe");
const invUl = document.getElementById("inv");
const itemInput = document.getElementById("item");
const addItemBtn = document.getElementById("addItem");
const salvarFichaBtn = document.getElementById("salvarFicha");

// ==================== MAPA ====================
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let tokens = [];
let dragging = null;
let scale = 1;

// ==================== NAVEGAÇÃO ====================
document.querySelectorAll("[data-go]").forEach(btn => {
    btn.addEventListener("click", () => {
        telas.forEach(t => t.classList.remove("ativa"));
        document.getElementById(btn.dataset.go).classList.add("ativa");
    });
});

// ==================== ROLAGEM ====================
function rolar(exp) {
    const match = exp.match(/(\d+)d(\d+)([+-]\d+)?/i);
    if (!match) return "Erro";
    let qtd = parseInt(match[1]);
    let faces = parseInt(match[2]);
    let bonus = parseInt(match[3] || 0);
    let total = 0, rolls = [];
    for (let i = 0; i < qtd; i++) {
        let r = Math.floor(Math.random() * faces) + 1;
        rolls.push(r);
        total += r;
    }
    total += bonus;
    return { total, rolls, exp };
}

btnRolar.addEventListener("click", () => {
    let exp = inputDado.value.trim();
    let r = rolar(exp);
    if (r === "Erro") return alert("Formato inválido! Ex: 1d20+5");

    log.innerHTML += `<p style="color:#ff2a2a">🎲 ${exp} → [${r.rolls}] = <strong>${r.total}</strong></p>`;
    log.scrollTop = log.scrollHeight;
    socket.emit("roll", { exp, total: r.total, rolls: r.rolls });
});

socket.on("roll", (data) => {
    log.innerHTML += `<p style="color:orange">🩸 Outro Agente rolou: ${data.exp} = <strong>${data.total}</strong></p>`;
    log.scrollTop = log.scrollHeight;
});

// ==================== AGENTES ====================
let agentes = JSON.parse(localStorage.getItem("agentes")) || [];
let atual = null;

function salvar() {
    localStorage.setItem("agentes", JSON.stringify(agentes));
}

function renderLista() {
    listaAgentes.innerHTML = "";
    agentes.forEach((a, i) => {
        let li = document.createElement("li");
        li.innerHTML = `
            <strong>${a.nome}</strong> (${a.classe || 'Agente'})
            <button data-open="${i}">ABRIR FICHA</button>
            <button data-del="${i}" style="background:#400000;">DELETAR</button>
        `;
        listaAgentes.appendChild(li);
    });

    document.querySelectorAll("[data-open]").forEach(b => b.onclick = () => abrirFicha(+b.dataset.open));
    document.querySelectorAll("[data-del]").forEach(b => {
        b.onclick = () => {
            if (confirm("Deletar agente permanentemente?")) {
                agentes.splice(+b.dataset.del, 1);
                salvar();
                renderLista();
            }
        };
    });
}

btnCriarAgente.onclick = () => {
    let nome = nomeAgenteEl.value.trim();
    if (!nome) return alert("Nome do agente obrigatório!");
    agentes.push({
        nome,
        classe: classeAgenteEl.value || "Supressor",
        ficha: { forca: 10, agi: 10, int: 10, pre: 10, inv: [] }
    });
    salvar();
    renderLista();
    nomeAgenteEl.value = classeAgenteEl.value = "";
};

// ==================== FICHA ====================
function abrirFicha(i) {
    atual = i;
    let a = agentes[i];
    tituloFicha.innerText = `${a.nome} — ${a.classe}`;
    forcaInput.value = a.ficha.forca;
    agiInput.value = a.ficha.agi;
    intInput.value = a.ficha.int;
    preInput.value = a.ficha.pre;
    renderInv();
    calc();
    telas.forEach(t => t.classList.remove("ativa"));
    document.getElementById("ficha").classList.add("ativa");
}

function calc() {
    let f = +forcaInput.value || 0;
    let p = +preInput.value || 0;
    hpEl.innerHTML = `❤️ HP: <strong>${20 + f * 5}</strong>`;
    peEl.innerHTML = `⚡ PE: <strong>${10 + p * 5}</strong>`;
}

[forcaInput, agiInput, intInput, preInput].forEach(el => el.addEventListener("input", calc));

function renderInv() {
    if (atual === null) return;
    invUl.innerHTML = "";
    agentes[atual].ficha.inv.forEach((item, i) => {
        let li = document.createElement("li");
        li.innerHTML = `${item} <button data-del-inv="${i}">X</button>`;
        invUl.appendChild(li);
    });
    document.querySelectorAll("[data-del-inv]").forEach(btn => {
        btn.onclick = () => {
            agentes[atual].ficha.inv.splice(+btn.dataset.delInv, 1);
            renderInv();
            salvar();
        };
    });
}

addItemBtn.onclick = () => {
    let item = itemInput.value.trim();
    if (!item || atual === null) return;
    agentes[atual].ficha.inv.push(item);
    renderInv();
    salvar();
    itemInput.value = "";
};

salvarFichaBtn.onclick = () => {
    if (atual === null) return;
    let a = agentes[atual];
    a.ficha.forca = +forcaInput.value;
    a.ficha.agi = +agiInput.value;
    a.ficha.int = +intInput.value;
    a.ficha.pre = +preInput.value;
    salvar();
    alert("✅ Ficha salva no Abismo da Contenção!");
};

// ==================== MAPA (estilo Lobotomy) ====================
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(scale, scale);

    ctx.strokeStyle = "#550000";
    ctx.lineWidth = 1;
    for (let x = 0; x < 800; x += 50) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 500); ctx.stroke();
    }
    for (let y = 0; y < 500; y += 50) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(800, y); ctx.stroke();
    }

    ctx.fillStyle = "#ff2a2a";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ff0000";
    tokens.forEach(t => {
        ctx.beginPath();
        ctx.arc(t.x, t.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000"; ctx.font = "10px Courier"; ctx.fillText("A", t.x-4, t.y+3);
        ctx.fillStyle = "#ff2a2a";
    });
    ctx.restore();
}

canvas.addEventListener("click", e => {
    tokens.push({ x: e.offsetX / scale, y: e.offsetY / scale });
    draw();
});

canvas.addEventListener("mousedown", e => {
    let mx = e.offsetX / scale, my = e.offsetY / scale;
    dragging = tokens.find(t => Math.hypot(t.x - mx, t.y - my) < 15);
});

canvas.addEventListener("mousemove", e => {
    if (dragging) {
        dragging.x = e.offsetX / scale;
        dragging.y = e.offsetY / scale;
        draw();
    }
});

canvas.addEventListener("mouseup", () => dragging = null);
canvas.addEventListener("wheel", e => {
    scale = Math.max(0.5, Math.min(3, scale - e.deltaY * 0.002));
    draw();
});

// ==================== INIT ====================
renderLista();
draw();
