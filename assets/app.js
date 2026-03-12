const SUPABASE_URL = "COLE_AQUI_SUA_SUPABASE_URL";
const SUPABASE_ANON_KEY = "COLE_AQUI_SUA_SUPABASE_ANON_KEY";
const TABLE_NAME = "estoque_registros";

const CONFIG_GERAL = {
  GELADEIRA: {
    CANTALOUPE: {
      SAMBA: (t) => 65,
      BRAZIL: (t) => 65,
    },
    MATISSE: {
      SAMBA: (t) => 60,
    },
    MELANCIA: {
      SAMBA: (t) => (t >= 4 && t <= 7 ? 66 : 65),
      "MOSSORÓ": (t) => 60,
    },
  },
  CHÃO: {
    AMARELO: {
      ANGEL: (t) => (t >= 4 && t <= 9 ? 72 : 65),
      SAMBA: (t) => (t >= 4 && t <= 7 ? 66 : 65),
      BRAZIL: (t) => (t >= 4 && t <= 7 ? 66 : 65),
      "MOSSORÓ": (t) => (t >= 4 && t <= 7 ? 72 : 70),
      "MOSSORÓ REDE": (t) => (t >= 4 && t <= 7 ? 72 : 70),
    },
  },
  ITAUEIRA: {
    AMARELO: {
      REI: (t) => (t === 4 ? 77 : 84),
      CEPI: (t) => (t === 4 ? 77 : 84),
    },
  },
};

const NUMBER_WORDS = {
  ZERO: 0,
  UM: 1,
  UMA: 1,
  DOIS: 2,
  DUAS: 2,
  TRES: 3,
  QUATRO: 4,
  CINCO: 5,
  SEIS: 6,
  SETE: 7,
  OITO: 8,
  NOVE: 9,
  DEZ: 10,
  ONZE: 11,
  DOZE: 12,
  TREZE: 13,
  CATORZE: 14,
  QUATORZE: 14,
  QUINZE: 15,
  DEZESSEIS: 16,
  DEZESSETE: 17,
  DEZOITO: 18,
  DEZENOVE: 19,
  VINTE: 20,
};

const state = {
  setor: Object.keys(CONFIG_GERAL)[0],
  produto: null,
  marca: null,
  estoque: [],
  user: null,
};

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const elements = {
  authPanel: document.getElementById("auth-panel"),
  appPanel: document.getElementById("app-panel"),
  loginBtn: document.getElementById("login-btn"),
  signupBtn: document.getElementById("signup-btn"),
  logoutBtn: document.getElementById("logout-btn"),
  email: document.getElementById("email"),
  password: document.getElementById("password"),
  authMsg: document.getElementById("auth-msg"),
  userEmail: document.getElementById("user-email"),
  setorSelect: document.getElementById("setor-select"),
  ctxSetor: document.getElementById("ctx-setor"),
  ctxProduto: document.getElementById("ctx-produto"),
  ctxMarca: document.getElementById("ctx-marca"),
  clearContext: document.getElementById("clear-context"),
  voiceBtn: document.getElementById("voice-btn"),
  voiceStatus: document.getElementById("voice-status"),
  voiceLast: document.getElementById("voice-last"),
  commandInput: document.getElementById("command-input"),
  processBtn: document.getElementById("process-btn"),
  messages: document.getElementById("messages"),
  tableBody: document.getElementById("table-body"),
  totalGeral: document.getElementById("total-geral"),
  exportBtn: document.getElementById("export-btn"),
  clearBtn: document.getElementById("clear-btn"),
};

function normalizeText(text) {
  return (text || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findInText(text, map) {
  const keys = Object.keys(map).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (key && text.includes(key)) {
      return map[key];
    }
  }
  return null;
}

function extractNumber(text) {
  const digitMatch = text.match(/\d+/);
  if (digitMatch) {
    return Number.parseInt(digitMatch[0], 10);
  }
  for (const [word, value] of Object.entries(NUMBER_WORDS)) {
    if (text.includes(word)) {
      return value;
    }
  }
  return null;
}

function pushMessage(type, text) {
  const msg = document.createElement("div");
  msg.className = `msg ${type}`;
  msg.textContent = text;
  elements.messages.prepend(msg);
  while (elements.messages.children.length > 5) {
    elements.messages.removeChild(elements.messages.lastChild);
  }
}

function renderContext() {
  elements.ctxSetor.textContent = state.setor || "--";
  elements.ctxProduto.textContent = state.produto || "--";
  elements.ctxMarca.textContent = state.marca || "--";
  elements.setorSelect.value = state.setor;
}

function renderTable() {
  elements.tableBody.innerHTML = "";
  let total = 0;
  const rows = state.estoque.filter((row) => row.setor === state.setor);
  for (const row of rows) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.produto}</td>
      <td>${row.marca}</td>
      <td>${row.tipo}</td>
      <td>${row.caixas_pallet}</td>
      <td>${row.pallets}</td>
      <td>${row.total_caixas}</td>
    `;
    elements.tableBody.appendChild(tr);
    total += row.total_caixas;
  }
  elements.totalGeral.textContent = total;
}

function updateLocalRecord({ setor, produto, marca, tipo, caixas_pallet }) {
  const found = state.estoque.find(
    (row) =>
      row.setor === setor &&
      row.produto === produto &&
      row.marca === marca &&
      row.tipo === tipo
  );
  if (found) {
    found.pallets += 1;
    found.total_caixas = found.pallets * found.caixas_pallet;
  } else {
    state.estoque.push({
      setor,
      produto,
      marca,
      tipo,
      caixas_pallet,
      pallets: 1,
      total_caixas: caixas_pallet,
    });
  }
}

async function loadRecords() {
  if (!state.user) return;
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    pushMessage("error", `Erro ao carregar dados: ${error.message}`);
    return;
  }

  state.estoque = (data || []).map((row) => ({
    setor: row.setor,
    produto: row.produto,
    marca: row.marca,
    tipo: row.tipo,
    caixas_pallet: row.caixas_pallet,
    pallets: row.pallets,
    total_caixas: row.total_caixas,
  }));
  renderTable();
}

async function upsertRecord({ setor, produto, marca, tipo, caixas_pallet }) {
  if (!state.user) return;
  const { data: existing, error: selectError } = await supabase
    .from(TABLE_NAME)
    .select("id, pallets, caixas_pallet")
    .eq("user_id", state.user.id)
    .eq("setor", setor)
    .eq("produto", produto)
    .eq("marca", marca)
    .eq("tipo", tipo)
    .maybeSingle();

  if (selectError) {
    pushMessage("error", `Erro ao consultar registro: ${selectError.message}`);
    return;
  }

  if (existing) {
    const newPallets = existing.pallets + 1;
    const newTotal = newPallets * existing.caixas_pallet;
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({
        pallets: newPallets,
        total_caixas: newTotal,
      })
      .eq("id", existing.id);

    if (error) {
      pushMessage("error", `Erro ao atualizar registro: ${error.message}`);
    }
  } else {
    const { error } = await supabase.from(TABLE_NAME).insert({
      user_id: state.user.id,
      setor,
      produto,
      marca,
      tipo,
      caixas_pallet,
      pallets: 1,
      total_caixas: caixas_pallet,
    });

    if (error) {
      pushMessage("error", `Erro ao salvar registro: ${error.message}`);
    }
  }
}

function buildMaps(setor) {
  const products = CONFIG_GERAL[setor];
  const productMap = {};
  const brandMap = {};
  const brandToProduct = {};

  Object.keys(products).forEach((product) => {
    productMap[normalizeText(product)] = product;
    Object.keys(products[product]).forEach((brand) => {
      const nb = normalizeText(brand);
      brandMap[nb] = brand;
      if (brandToProduct[nb] && brandToProduct[nb] !== product) {
        brandToProduct[nb] = null;
      } else {
        brandToProduct[nb] = product;
      }
    });
  });

  return { products, productMap, brandMap, brandToProduct };
}

function processCommand(rawText) {
  const normInput = normalizeText(rawText);
  if (!normInput) return;

  const sectorMap = {};
  Object.keys(CONFIG_GERAL).forEach((sector) => {
    sectorMap[normalizeText(sector)] = sector;
  });

  const sectorFound = findInText(normInput, sectorMap);
  if (sectorFound) {
    state.setor = sectorFound;
    state.produto = null;
    state.marca = null;
    pushMessage("info", `Setor fixado: ${sectorFound}`);
  }

  const { products, productMap, brandMap, brandToProduct } = buildMaps(
    state.setor
  );

  const productFound = findInText(normInput, productMap);
  const brandFound = findInText(normInput, brandMap);

  if (productFound) {
    state.produto = productFound;
    pushMessage("info", `Produto fixado: ${productFound}`);
    if (brandFound) {
      if (brandFound in products[productFound]) {
        state.marca = brandFound;
        pushMessage("info", `Marca fixada: ${brandFound}`);
      } else {
        pushMessage(
          "warn",
          `Marca '${brandFound}' não pertence ao produto '${productFound}'.`
        );
      }
    } else {
      state.marca = null;
    }
  } else if (brandFound) {
    if (state.produto && brandFound in products[state.produto]) {
      state.marca = brandFound;
      pushMessage("info", `Marca fixada: ${brandFound}`);
    } else {
      const inferredProduct = brandToProduct[normalizeText(brandFound)];
      if (inferredProduct) {
        state.produto = inferredProduct;
        state.marca = brandFound;
        pushMessage("info", `Produto fixado: ${inferredProduct}`);
        pushMessage("info", `Marca fixada: ${brandFound}`);
      } else {
        pushMessage(
          "warn",
          "Marca aparece em mais de um produto. Diga o produto junto."
        );
      }
    }
  }

  const tipo = extractNumber(normInput);
  if (tipo !== null) {
    if (!state.produto || !state.marca) {
      pushMessage(
        "warn",
        "Diga primeiro o produto e a marca antes de informar o número."
      );
      renderContext();
      return;
    }

    const regra = products[state.produto]?.[state.marca];
    if (!regra) {
      pushMessage(
        "error",
        `Essa marca '${state.marca}' não tem regra para o produto '${state.produto}'.`
      );
      renderContext();
      return;
    }

    const caixasPallet = regra(tipo);
    updateLocalRecord({
      setor: state.setor,
      produto: state.produto,
      marca: state.marca,
      tipo,
      caixas_pallet: caixasPallet,
    });
    renderTable();
    pushMessage("success", `Registrado: ${state.produto} ${state.marca} Tipo ${tipo}`);

    upsertRecord({
      setor: state.setor,
      produto: state.produto,
      marca: state.marca,
      tipo,
      caixas_pallet: caixasPallet,
    }).then(loadRecords);
  }

  renderContext();
}

function setupVoice() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    elements.voiceStatus.textContent =
      "Navegador não suporta reconhecimento de voz. Use Chrome ou Edge.";
    elements.voiceBtn.disabled = true;
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "pt-BR";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  let listening = false;

  elements.voiceBtn.addEventListener("click", () => {
    if (!listening) {
      recognition.start();
    } else {
      recognition.stop();
    }
  });

  recognition.onstart = () => {
    listening = true;
    elements.voiceStatus.textContent = "Ouvindo...";
    elements.voiceBtn.textContent = "Parar";
  };

  recognition.onend = () => {
    listening = false;
    elements.voiceStatus.textContent = "Parado.";
    elements.voiceBtn.textContent = "Iniciar escuta";
  };

  recognition.onerror = (event) => {
    elements.voiceStatus.textContent = `Erro: ${event.error}`;
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    elements.voiceLast.value = transcript;
    elements.commandInput.value = transcript;
    processCommand(transcript);
  };
}

function setupEvents() {
  elements.loginBtn.addEventListener("click", async () => {
    const email = elements.email.value.trim();
    const password = elements.password.value;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      elements.authMsg.textContent = error.message;
      elements.authMsg.className = "msg error";
    }
  });

  elements.signupBtn.addEventListener("click", async () => {
    const email = elements.email.value.trim();
    const password = elements.password.value;
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      elements.authMsg.textContent = error.message;
      elements.authMsg.className = "msg error";
    } else {
      elements.authMsg.textContent =
        "Conta criada. Se a confirmação de email estiver ativa, verifique sua caixa de entrada.";
      elements.authMsg.className = "msg info";
    }
  });

  elements.logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
  });

  elements.setorSelect.addEventListener("change", (event) => {
    state.setor = event.target.value;
    state.produto = null;
    state.marca = null;
    pushMessage("info", `Setor fixado: ${state.setor}`);
    renderContext();
    renderTable();
  });

  elements.clearContext.addEventListener("click", () => {
    state.produto = null;
    state.marca = null;
    pushMessage("info", "Contexto limpo.");
    renderContext();
  });

  elements.processBtn.addEventListener("click", () => {
    processCommand(elements.commandInput.value);
  });

  elements.commandInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      processCommand(elements.commandInput.value);
    }
  });

  elements.exportBtn.addEventListener("click", () => {
    const rows = state.estoque.filter((row) => row.setor === state.setor);
    if (!rows.length) {
      pushMessage("warn", "Nenhum item para exportar.");
      return;
    }
    const header = [
      "Setor",
      "Produto",
      "Marca",
      "Tipo",
      "Caixas/Pallet",
      "Pallets",
      "Total Caixas",
    ];
    const csv = [
      header.join(";"),
      ...rows.map((row) =>
        [
          row.setor,
          row.produto,
          row.marca,
          row.tipo,
          row.caixas_pallet,
          row.pallets,
          row.total_caixas,
        ].join(";")
      ),
    ].join("\\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `estoque_${state.setor}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });

  elements.clearBtn.addEventListener("click", async () => {
    if (!state.user) return;
    const confirmClear = window.confirm(
      `Deseja apagar todas as contagens do setor ${state.setor}?`
    );
    if (!confirmClear) return;
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq("user_id", state.user.id)
      .eq("setor", state.setor);
    if (error) {
      pushMessage("error", `Erro ao limpar: ${error.message}`);
      return;
    }
    state.estoque = state.estoque.filter((row) => row.setor !== state.setor);
    renderTable();
    pushMessage("success", "Contagem limpa para o setor atual.");
  });
}

function setupAuth() {
  supabase.auth.onAuthStateChange(async (_event, session) => {
    state.user = session?.user ?? null;
    if (state.user) {
      elements.authPanel.classList.add("hidden");
      elements.appPanel.classList.remove("hidden");
      elements.userEmail.textContent = state.user.email || "--";
      await loadRecords();
      renderContext();
    } else {
      elements.authPanel.classList.remove("hidden");
      elements.appPanel.classList.add("hidden");
      state.estoque = [];
      renderTable();
    }
  });
}

function initSetorSelect() {
  elements.setorSelect.innerHTML = "";
  Object.keys(CONFIG_GERAL).forEach((setor) => {
    const option = document.createElement("option");
    option.value = setor;
    option.textContent = setor;
    elements.setorSelect.appendChild(option);
  });
  elements.setorSelect.value = state.setor;
}

initSetorSelect();
renderContext();
renderTable();
setupVoice();
setupEvents();
setupAuth();
