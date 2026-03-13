const SUPABASE_URL = "https://ldkazwnzfppcsoolydkp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxka2F6d256ZnBwY3Nvb2x5ZGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMTgwNTQsImV4cCI6MjA4ODg5NDA1NH0.oLmwo4w2WZb6el81BuWfUhWFvKRAR6EhGr96ey8iR3s";
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
      MOSSORO: (t) => 60,
    },
  },
  CHÃO: {
    AMARELO: {
      ANGEL: (t) => (t >= 4 && t <= 9 ? 72 : 65),
      SAMBA: (t) => (t >= 4 && t <= 7 ? 66 : 65),
      BRAZIL: (t) => (t >= 4 && t <= 7 ? 66 : 65),
      MOSSORO: (t) => (t >= 4 && t <= 7 ? 72 : 70),
      "MOSSORO REDE": (t) => (t >= 4 && t <= 7 ? 72 : 70),
    },
    SAPO: {
      ANGEL: (t) => (t >= 4 && t <= 9 ? 72 : 65),
     
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
  countMode: "current",
  sessionRows: [],
  userRows: [],
  editTarget: null,
  selectedRowKey: null,
  publicQuery: "",
  publicFilters: {
    setor: "",
    produto: "",
    marca: "",
    tipo: "",
  },
  publicRows: [],
  user: null,
};

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const elements = {
  menuView: document.getElementById("menu-view"),
  menuCount: document.getElementById("menu-count"),
  menuUser: document.getElementById("menu-user"),
  menuUserEmail: document.getElementById("menu-user-email"),
  menuLogout: document.getElementById("menu-logout"),
  publicPanel: document.getElementById("public-panel"),
  publicSearch: document.getElementById("public-search"),
  publicFilterBtn: document.getElementById("public-filter-btn"),
  filterModal: document.getElementById("filter-modal"),
  filterClose: document.getElementById("filter-close"),
  filterCloseBtn: document.getElementById("filter-close-btn"),
  filterApply: document.getElementById("filter-apply"),
  filterClear: document.getElementById("filter-clear"),
  filterSetor: document.getElementById("filter-setor"),
  filterProduto: document.getElementById("filter-produto"),
  filterMarca: document.getElementById("filter-marca"),
  filterTipo: document.getElementById("filter-tipo"),
  publicTableBody: document.getElementById("public-table-body"),
  publicTotalGeral: document.getElementById("public-total-geral"),
  publicExportBtn: document.getElementById("public-export-btn"),
  publicRefresh: document.getElementById("public-refresh"),
  publicMsg: document.getElementById("public-msg"),
  authPanel: document.getElementById("auth-panel"),
  countPanel: document.getElementById("count-panel"),
  loginBtn: document.getElementById("login-btn"),
  signupBtn: document.getElementById("signup-btn"),
  email: document.getElementById("email"),
  password: document.getElementById("password"),
  authMsg: document.getElementById("auth-msg"),
  setorSelect: document.getElementById("setor-select"),
  ctxSetor: document.getElementById("ctx-setor"),
  ctxProduto: document.getElementById("ctx-produto"),
  ctxMarca: document.getElementById("ctx-marca"),
  clearContext: document.getElementById("clear-context"),
  modeCurrentBtn: document.getElementById("mode-current"),
  modeNewBtn: document.getElementById("mode-new"),
  countModeTag: document.getElementById("count-mode-tag"),
  newCountActions: document.getElementById("new-count-actions"),
  saveNewCountBtn: document.getElementById("save-new-count"),
  discardNewCountBtn: document.getElementById("discard-new-count"),
  addItemBtn: document.getElementById("add-item-btn"),
  editItemBtn: document.getElementById("edit-item-btn"),
  editModal: document.getElementById("edit-modal"),
  editClose: document.getElementById("edit-close"),
  editCloseBtn: document.getElementById("edit-close-btn"),
  editTitle: document.getElementById("edit-title"),
  editSetor: document.getElementById("edit-setor"),
  editProduto: document.getElementById("edit-produto"),
  editMarca: document.getElementById("edit-marca"),
  editTipo: document.getElementById("edit-tipo"),
  editCaixas: document.getElementById("edit-caixas"),
  editPallets: document.getElementById("edit-pallets"),
  editSave: document.getElementById("edit-save"),
  editMsg: document.getElementById("edit-msg"),
  voiceBtn: document.getElementById("voice-btn"),
  voiceStatus: document.getElementById("voice-status"),
  voiceLast: document.getElementById("voice-last"),
  commandInput: document.getElementById("command-input"),
  processBtn: document.getElementById("process-btn"),
  messages: document.getElementById("messages"),
  countTableBody: document.getElementById("count-table-body"),
  countTotalGeral: document.getElementById("count-total-geral"),
  countExportBtn: document.getElementById("count-export-btn"),
  countClearBtn: document.getElementById("count-clear-btn"),
};

const PAGE_MODE = document.body?.dataset?.page || "view";

function normalizeText(text) {
  return (text || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toAuthEmail(value) {
  const raw = (value || "").trim().toLowerCase();
  if (!raw) return "";
  if (raw.includes("@")) return raw;
  const normalized = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const sanitized = normalized
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9._-]/g, "");
  if (!sanitized) return "";
  return `${sanitized}@cd.local`;
}

function displayUserFromEmail(email) {
  if (!email) return "--";
  return email.split("@")[0] || email;
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
  const normalized = normalizeText(text);
  for (const [word, value] of Object.entries(NUMBER_WORDS)) {
    if (normalized.includes(word)) {
      return value;
    }
  }
  return null;
}

function pushMessage(type, text) {
  if (!elements.messages) return;
  const msg = document.createElement("div");
  msg.className = `msg ${type}`;
  msg.textContent = text;
  elements.messages.prepend(msg);
  while (elements.messages.children.length > 5) {
    elements.messages.removeChild(elements.messages.lastChild);
  }
}

function setPublicMessage(type, text) {
  if (!elements.publicMsg) return;
  elements.publicMsg.innerHTML = "";
  if (!text) return;
  const msg = document.createElement("div");
  msg.className = `msg ${type}`;
  msg.textContent = text;
  elements.publicMsg.appendChild(msg);
}

function setEditMessage(type, text) {
  if (!elements.editMsg) return;
  elements.editMsg.innerHTML = "";
  if (!text) return;
  const msg = document.createElement("div");
  msg.className = `msg ${type}`;
  msg.textContent = text;
  elements.editMsg.appendChild(msg);
}

function renderContext() {
  if (elements.ctxSetor) elements.ctxSetor.textContent = state.setor || "--";
  if (elements.ctxProduto) elements.ctxProduto.textContent = state.produto || "--";
  if (elements.ctxMarca) elements.ctxMarca.textContent = state.marca || "--";
  if (elements.setorSelect) elements.setorSelect.value = state.setor;
}

function aggregateRows(rows) {
  const map = new Map();
  (rows || []).forEach((row) => {
    const key = `${row.setor}|||${row.produto}|||${row.marca}|||${row.tipo}`;
    const current = map.get(key);
    if (current) {
      current.pallets += row.pallets;
      current.total_caixas += row.total_caixas;
    } else {
      map.set(key, {
        setor: row.setor,
        produto: row.produto,
        marca: row.marca,
        tipo: row.tipo,
        caixas_pallet: row.caixas_pallet,
        pallets: row.pallets,
        total_caixas: row.total_caixas,
      });
    }
  });
  return Array.from(map.values());
}

function renderPublicTable() {
  if (!elements.publicTableBody || !elements.publicTotalGeral) return;
  elements.publicTableBody.innerHTML = "";
  let total = 0;
  const rows = state.publicRows.filter(matchesPublicFilters);
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
    elements.publicTableBody.appendChild(tr);
    total += row.total_caixas;
  }
  elements.publicTotalGeral.textContent = total;
}

function matchesPublicFilters(row) {
  const { setor, produto, marca, tipo } = state.publicFilters;
  if (setor && row.setor !== setor) return false;
  if (produto && row.produto !== produto) return false;
  if (marca && row.marca !== marca) return false;
  if (tipo) {
    const tipoNum = Number.parseInt(tipo, 10);
    if (!Number.isNaN(tipoNum) && row.tipo !== tipoNum) return false;
  }
  const query = normalizeText(state.publicQuery);
  if (query) {
    const haystack = normalizeText(
      `${row.setor} ${row.produto} ${row.marca} ${row.tipo}`
    );
    if (!haystack.includes(query)) return false;
  }
  return true;
}

function renderCountTable() {
  if (!elements.countTableBody || !elements.countTotalGeral) return;
  elements.countTableBody.innerHTML = "";
  let total = 0;
  const showActions = PAGE_MODE === "edit";
  const rows = getCountRowsForSetor();
  for (const row of rows) {
    const tr = document.createElement("tr");
    const rowKey = getRowKey(row);
    if (rowKey) {
      tr.dataset.rowKey = rowKey;
      if (state.selectedRowKey === rowKey) {
        tr.classList.add("row-selected");
      }
      tr.addEventListener("click", (event) => {
        if (event.target.closest(".row-actions")) return;
        state.selectedRowKey = rowKey;
        renderCountTable();
      });
    }
    const totalCaixas = Number(
      row.total_caixas ?? row.pallets * row.caixas_pallet
    );
    tr.innerHTML = `
      <td>${row.produto}</td>
      <td>${row.marca}</td>
      <td>${row.tipo}</td>
      <td>${row.caixas_pallet}</td>
      <td>${row.pallets}</td>
      <td>${totalCaixas}</td>
    `;
    if (showActions) {
      const actionsTd = document.createElement("td");
      actionsTd.className = "row-actions";
      const editBtn = document.createElement("button");
      editBtn.className = "ghost";
      editBtn.textContent = "Editar";
      editBtn.addEventListener("click", () => {
        openEditModal("edit", row);
      });
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "danger";
      deleteBtn.textContent = "Remover";
      deleteBtn.addEventListener("click", () => {
        removeRow(row);
      });
      actionsTd.append(editBtn, deleteBtn);
      tr.appendChild(actionsTd);
    }
    elements.countTableBody.appendChild(tr);
    total += totalCaixas;
  }
  elements.countTotalGeral.textContent = total;
}

function getCountRowsForSetor() {
  const source =
    state.countMode === "new" ? state.sessionRows : state.userRows;
  if (!elements.setorSelect) return source;
  return source.filter((row) => row.setor === state.setor);
}

function updateAggregateRecord({ setor, produto, marca, tipo, caixas_pallet }) {
  const found = state.publicRows.find(
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
    state.publicRows.push({
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

async function loadPublicRecords() {
  const { data, error } = await supabaseClient
    .from(TABLE_NAME)
    .select("setor, produto, marca, tipo, caixas_pallet, pallets, total_caixas");

  if (error) {
    setPublicMessage("error", `Erro ao carregar dados: ${error.message}`);
    return;
  }

  state.publicRows = aggregateRows(data || []);
  renderPublicTable();
  renderCountTable();
  setPublicMessage("", "");
}

async function loadUserRecords(options = {}) {
  const { showError = true } = options;
  if (!state.user) {
    state.userRows = [];
    renderCountTable();
    return { data: [], error: null };
  }
  const { data, error } = await supabaseClient
    .from(TABLE_NAME)
    .select(
      "id, user_id, setor, produto, marca, tipo, caixas_pallet, pallets, total_caixas"
    )
    .eq("user_id", state.user.id);

  if (error) {
    if (showError) {
      pushMessage("error", `Erro ao carregar itens do usuario: ${error.message}`);
    }
    return { data: null, error };
  }

  state.userRows = data || [];
  renderCountTable();
  return { data: state.userRows, error: null };
}

async function upsertRecord({ setor, produto, marca, tipo, caixas_pallet }) {
  if (!state.user) return;
  const { data: existing, error: selectError } = await supabaseClient
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
    const { error } = await supabaseClient
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
    const { error } = await supabaseClient.from(TABLE_NAME).insert({
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

async function processCommand(rawText) {
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
          `Marca '${brandFound}' n?o pertence ao produto '${productFound}'.`
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
        "Diga primeiro o produto e a marca antes de informar o n?mero."
      );
      renderContext();
      return;
    }

    const regra = products[state.produto]?.[state.marca];
    if (!regra) {
      pushMessage(
        "error",
        `Essa marca '${state.marca}' n?o tem regra para o produto '${state.produto}'.`
      );
      renderContext();
      return;
    }

    const caixasPallet = regra(tipo);
    if (state.countMode === "new") {
      updateSessionAggregateRecord({
        setor: state.setor,
        produto: state.produto,
        marca: state.marca,
        tipo,
        caixas_pallet: caixasPallet,
      });
      renderCountTable();
      pushMessage(
        "success",
        `Registrado (nova contagem): ${state.produto} ${state.marca} Tipo ${tipo}`
      );
    } else {
      updateAggregateRecord({
        setor: state.setor,
        produto: state.produto,
        marca: state.marca,
        tipo,
        caixas_pallet: caixasPallet,
      });
      renderPublicTable();
      renderCountTable();
      pushMessage(
        "success",
        `Registrado: ${state.produto} ${state.marca} Tipo ${tipo}`
      );

      await upsertRecord({
        setor: state.setor,
        produto: state.produto,
        marca: state.marca,
        tipo,
        caixas_pallet: caixasPallet,
      });
      await loadUserRecords();
      await loadPublicRecords();
    }
  }

  renderContext();
}

function setupVoice() {
  if (PAGE_MODE !== "edit") return;
  if (!elements.voiceBtn || !elements.voiceStatus || !elements.voiceLast) return;
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    elements.voiceStatus.textContent =
      "Navegador nao suporta reconhecimento de voz. Use Chrome ou Edge.";
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
    if (elements.commandInput) {
      elements.commandInput.value = transcript;
    }
    processCommand(transcript);
  };
}

function exportRows(rows, filename) {
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
  ].join("");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function showAuthPanel() {
  if (elements.authPanel) {
    elements.authPanel.classList.remove("hidden");
    elements.authPanel.scrollIntoView({ behavior: "smooth" });
  }
  if (elements.countPanel) elements.countPanel.classList.add("hidden");
}

function showCountPanel() {
  if (elements.authPanel) elements.authPanel.classList.add("hidden");
  if (elements.countPanel) {
    elements.countPanel.classList.remove("hidden");
    elements.countPanel.scrollIntoView({ behavior: "smooth" });
  }
}

function updateSessionAggregateRecord({
  setor,
  produto,
  marca,
  tipo,
  caixas_pallet,
}) {
  const found = state.sessionRows.find(
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
    state.sessionRows.push({
      _localId: `local_${Date.now()}_${Math.random().toString(16).slice(2)}`,
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

function cleanLabel(value) {
  return normalizeText(value);
}

function getRowKey(row) {
  return row?.id ?? row?._localId ?? null;
}

function findCurrentRowByKey(key) {
  const source = state.countMode === "new" ? state.sessionRows : state.userRows;
  return source.find((row) => getRowKey(row) === key);
}

function openEditModal(mode, row = null) {
  if (!elements.editModal) return;
  state.editTarget = {
    mode,
    rowKey: getRowKey(row),
  };
  setEditMessage("", "");

  if (elements.editTitle) {
    elements.editTitle.textContent =
      mode === "add" ? "Adicionar item" : "Editar item";
  }

  if (elements.editSetor) {
    elements.editSetor.value = row?.setor || state.setor || "";
  }
  if (elements.editProduto) {
    elements.editProduto.value = row?.produto || "";
  }
  if (elements.editMarca) {
    elements.editMarca.value = row?.marca || "";
  }
  if (elements.editTipo) {
    elements.editTipo.value = row?.tipo ?? "";
  }
  if (elements.editCaixas) {
    elements.editCaixas.value = row?.caixas_pallet ?? "";
  }
  if (elements.editPallets) {
    elements.editPallets.value = row?.pallets ?? 1;
  }

  elements.editModal.classList.remove("hidden");
}

function closeEditModal() {
  if (!elements.editModal) return;
  elements.editModal.classList.add("hidden");
  state.editTarget = null;
}

function findSessionRowByKey(key) {
  return state.sessionRows.find((row) => getRowKey(row) === key);
}

function findUserRowByKeys({ setor, produto, marca, tipo }) {
  return state.userRows.find(
    (row) =>
      row.setor === setor &&
      row.produto === produto &&
      row.marca === marca &&
      row.tipo === tipo
  );
}

async function saveEditItem() {
  if (!elements.editSetor || !elements.editProduto || !elements.editMarca) return;

  setEditMessage("info", "Salvando...");

  const setor = elements.editSetor.value;
  const produto = cleanLabel(elements.editProduto.value);
  const marca = cleanLabel(elements.editMarca.value);
  const tipo = Number.parseInt(elements.editTipo.value, 10);
  const caixasPallet = Number.parseInt(elements.editCaixas.value, 10);
  const pallets = Number.parseInt(elements.editPallets.value, 10);

  if (!setor || !produto || !marca) {
    setEditMessage("error", "Preencha setor, produto e marca.");
    return;
  }
  if (Number.isNaN(tipo) || Number.isNaN(caixasPallet) || Number.isNaN(pallets)) {
    setEditMessage(
      "error",
      "Preencha tipo, caixas/pallet e pallets com numeros validos."
    );
    return;
  }

  const totalCaixas = caixasPallet * pallets;

  if (state.countMode === "new") {
    if (state.editTarget?.mode === "edit" && state.editTarget.rowKey) {
      const row = findSessionRowByKey(state.editTarget.rowKey);
      if (row) {
        row.setor = setor;
        row.produto = produto;
        row.marca = marca;
        row.tipo = tipo;
        row.caixas_pallet = caixasPallet;
        row.pallets = pallets;
        row.total_caixas = totalCaixas;
      }
    } else {
      const existing = state.sessionRows.find(
        (row) =>
          row.setor === setor &&
          row.produto === produto &&
          row.marca === marca &&
          row.tipo === tipo
      );
    if (existing) {
      existing.caixas_pallet = caixasPallet;
      existing.pallets = pallets;
      existing.total_caixas = totalCaixas;
    } else {
        state.sessionRows.push({
          _localId: `local_${Date.now()}_${Math.random().toString(16).slice(2)}`,
          setor,
          produto,
          marca,
          tipo,
          caixas_pallet: caixasPallet,
          pallets,
          total_caixas: totalCaixas,
        });
      }
    }
    renderCountTable();
    state.selectedRowKey = null;
    closeEditModal();
    return;
  }

  if (!state.user) {
    setEditMessage("error", "Faça login para salvar alteracoes.");
    return;
  }

  const payload = {
    user_id: state.user.id,
    setor,
    produto,
    marca,
    tipo,
    caixas_pallet: caixasPallet,
    pallets,
    total_caixas: totalCaixas,
  };

  if (state.editTarget?.mode === "edit" && state.editTarget.rowKey) {
    const { error } = await supabaseClient
      .from(TABLE_NAME)
      .update(payload)
      .eq("id", state.editTarget.rowKey)
      .eq("user_id", state.user.id);
    if (error) {
      setEditMessage("error", `Erro ao atualizar item: ${error.message}`);
      return;
    }
  } else {
    const existing = findUserRowByKeys({ setor, produto, marca, tipo });
    if (existing?.id) {
      const { error } = await supabaseClient
        .from(TABLE_NAME)
        .update(payload)
        .eq("id", existing.id)
        .eq("user_id", state.user.id);
      if (error) {
        setEditMessage("error", `Erro ao atualizar item: ${error.message}`);
        return;
      }
    } else {
      const { error } = await supabaseClient.from(TABLE_NAME).insert(payload);
      if (error) {
        setEditMessage("error", `Erro ao adicionar item: ${error.message}`);
        return;
      }
    }
  }

  const userResult = await loadUserRecords({ showError: false });
  if (userResult?.error) {
    setEditMessage(
      "error",
      `Erro ao atualizar lista: ${userResult.error.message}`
    );
    return;
  }
  await loadPublicRecords();
  state.selectedRowKey = null;
  closeEditModal();
}

async function removeRow(row) {
  const rowKey = getRowKey(row);
  if (!rowKey) return;
  const confirmDelete = window.confirm(
    `Remover o item ${row.produto} ${row.marca} Tipo ${row.tipo}?`
  );
  if (!confirmDelete) return;

  if (state.countMode === "new") {
    state.sessionRows = state.sessionRows.filter(
      (item) => getRowKey(item) !== rowKey
    );
    if (state.selectedRowKey === rowKey) {
      state.selectedRowKey = null;
    }
    renderCountTable();
    return;
  }

  if (!state.user) return;
  const { error } = await supabaseClient
    .from(TABLE_NAME)
    .delete()
    .eq("id", rowKey)
    .eq("user_id", state.user.id);
  if (error) {
    pushMessage("error", `Erro ao remover item: ${error.message}`);
    return;
  }
  if (state.selectedRowKey === rowKey) {
    state.selectedRowKey = null;
  }
  await loadUserRecords();
  await loadPublicRecords();
}

function hideCountPanels() {
  if (elements.countPanel) elements.countPanel.classList.add("hidden");
}

function hideAuthPanel() {
  if (elements.authPanel) elements.authPanel.classList.add("hidden");
}


function updateCountModeUI() {
  if (elements.modeCurrentBtn && elements.modeNewBtn) {
    if (state.countMode === "new") {
      elements.modeCurrentBtn.classList.remove("primary");
      elements.modeCurrentBtn.classList.add("ghost");
      elements.modeNewBtn.classList.remove("ghost");
      elements.modeNewBtn.classList.add("primary");
    } else {
      elements.modeCurrentBtn.classList.remove("ghost");
      elements.modeCurrentBtn.classList.add("primary");
      elements.modeNewBtn.classList.remove("primary");
      elements.modeNewBtn.classList.add("ghost");
    }
  }

  if (elements.countModeTag) {
    elements.countModeTag.classList.toggle(
      "hidden",
      state.countMode !== "new"
    );
  }

  if (elements.newCountActions) {
    elements.newCountActions.classList.toggle(
      "hidden",
      state.countMode !== "new"
    );
  }
}



function setCountMode(mode) {
  if (mode === state.countMode) return;
  if (mode === "new") {
    const confirmed = window.confirm(
      "Iniciar nova contagem? A contagem atual só será substituída quando você salvar."
    );
    if (!confirmed) return;
    state.countMode = "new";
    state.sessionRows = [];
    pushMessage(
      "info",
      "Nova contagem iniciada. Salve quando terminar para substituir a contagem antiga."
    );
  } else {
    state.countMode = "current";
    state.sessionRows = [];
  }
  updateCountModeUI();
  renderCountTable();
}

async function saveNewCount() {
  if (!state.user) {
    pushMessage("warn", "Faça login para salvar a nova contagem.");
    return;
  }
  if (!state.sessionRows.length) {
    pushMessage("warn", "Nenhum item na nova contagem para salvar.");
    return;
  }
  const confirmed = window.confirm(
    "Salvar nova contagem? Isso vai apagar a contagem antiga e substituir pela nova."
  );
  if (!confirmed) return;

  const { error: deleteError } = await supabaseClient
    .from(TABLE_NAME)
    .delete()
    .eq("user_id", state.user.id);
  if (deleteError) {
    pushMessage("error", `Erro ao apagar contagem antiga: ${deleteError.message}`);
    return;
  }

  const payload = state.sessionRows.map((row) => ({
    user_id: state.user.id,
    setor: row.setor,
    produto: row.produto,
    marca: row.marca,
    tipo: row.tipo,
    caixas_pallet: row.caixas_pallet,
    pallets: row.pallets,
    total_caixas: row.total_caixas,
  }));

  const { error: insertError } = await supabaseClient
    .from(TABLE_NAME)
    .insert(payload);
  if (insertError) {
    pushMessage("error", `Erro ao salvar nova contagem: ${insertError.message}`);
    return;
  }

  state.sessionRows = [];
  state.countMode = "current";
  updateCountModeUI();
  await loadUserRecords();
  await loadPublicRecords();
  pushMessage("success", "Nova contagem salva. Estoque atualizado.");
}

function discardNewCount() {
  const confirmed = window.confirm(
    "Descartar a nova contagem? Os dados não salvos serão perdidos."
  );
  if (!confirmed) return;
  state.sessionRows = [];
  state.countMode = "current";
  updateCountModeUI();
  renderCountTable();
  pushMessage("info", "Nova contagem descartada.");
}

function openFilterModal() {
  if (!elements.filterModal) return;
  buildFilterOptions();
  elements.filterModal.classList.remove("hidden");
}

function closeFilterModal() {
  if (!elements.filterModal) return;
  elements.filterModal.classList.add("hidden");
}

function setSelectOptions(select, options, currentValue) {
  select.innerHTML = "";
  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = "Todos";
  select.appendChild(empty);
  options.forEach((optionValue) => {
    const option = document.createElement("option");
    option.value = optionValue;
    option.textContent = optionValue;
    select.appendChild(option);
  });
  select.value = currentValue || "";
}

function listProductsBySetor(setor) {
  const products = new Set();
  if (setor) {
    Object.keys(CONFIG_GERAL[setor] || {}).forEach((p) => products.add(p));
  } else {
    Object.keys(CONFIG_GERAL).forEach((s) => {
      Object.keys(CONFIG_GERAL[s]).forEach((p) => products.add(p));
    });
  }
  return Array.from(products).sort();
}

function listBrands(setor, produto) {
  const brands = new Set();
  const setores = setor ? [setor] : Object.keys(CONFIG_GERAL);
  setores.forEach((s) => {
    const produtos = CONFIG_GERAL[s] || {};
    if (produto) {
      Object.keys(produtos[produto] || {}).forEach((b) => brands.add(b));
    } else {
      Object.keys(produtos).forEach((p) => {
        Object.keys(produtos[p] || {}).forEach((b) => brands.add(b));
      });
    }
  });
  return Array.from(brands).sort();
}

function buildFilterOptions() {
  if (
    !elements.filterSetor ||
    !elements.filterProduto ||
    !elements.filterMarca ||
    !elements.filterTipo
  ) {
    return;
  }
  const setor = state.publicFilters.setor;
  const produto = state.publicFilters.produto;
  const marca = state.publicFilters.marca;

  setSelectOptions(elements.filterSetor, Object.keys(CONFIG_GERAL).sort(), setor);
  setSelectOptions(elements.filterProduto, listProductsBySetor(setor), produto);
  setSelectOptions(
    elements.filterMarca,
    listBrands(setor, elements.filterProduto.value || produto),
    marca
  );

  elements.filterTipo.value = state.publicFilters.tipo || "";
}

function updateFilterDependencies() {
  if (!elements.filterSetor || !elements.filterProduto || !elements.filterMarca) {
    return;
  }
  const setor = elements.filterSetor.value;
  const produto = elements.filterProduto.value;
  setSelectOptions(elements.filterProduto, listProductsBySetor(setor), produto);
  setSelectOptions(elements.filterMarca, listBrands(setor, produto), elements.filterMarca.value);
}

function setupEvents() {
  if (elements.menuView) {
    if (elements.menuView.dataset.href) {
      elements.menuView.addEventListener("click", () => {
        window.location.href = elements.menuView.dataset.href;
      });
    } else if (elements.publicPanel) {
      elements.menuView.addEventListener("click", () => {
        elements.publicPanel.scrollIntoView({ behavior: "smooth" });
      });
    }
  }

  if (elements.menuCount) {
    if (elements.menuCount.dataset.href) {
      elements.menuCount.addEventListener("click", () => {
        window.location.href = elements.menuCount.dataset.href;
      });
    } else {
      elements.menuCount.addEventListener("click", () => {
        if (state.user) {
          showCountPanel();
        } else {
          showAuthPanel();
        }
      });
    }
  }

  if (elements.modeCurrentBtn) {
    elements.modeCurrentBtn.addEventListener("click", () => {
      setCountMode("current");
    });
  }

  if (elements.modeNewBtn) {
    elements.modeNewBtn.addEventListener("click", () => {
      setCountMode("new");
    });
  }



  if (elements.addItemBtn) {
    elements.addItemBtn.addEventListener("click", () => {
      openEditModal("add");
    });
  }

  if (elements.editItemBtn) {
    elements.editItemBtn.addEventListener("click", () => {
      if (!state.selectedRowKey) {
        window.alert("Selecione um item na tabela para editar.");
        return;
      }
      const row = findCurrentRowByKey(state.selectedRowKey);
      if (!row) {
        window.alert("Item selecionado nao encontrado.");
        return;
      }
      openEditModal("edit", row);
    });
  }

  if (elements.editClose) {
    elements.editClose.addEventListener("click", closeEditModal);
  }

  if (elements.editCloseBtn) {
    elements.editCloseBtn.addEventListener("click", closeEditModal);
  }

  if (elements.editSave) {
    elements.editSave.addEventListener("click", saveEditItem);
  }

  if (elements.menuLogout) {
    elements.menuLogout.addEventListener("click", async () => {
      await supabaseClient.auth.signOut();
    });
  }

  if (elements.loginBtn) {
    elements.loginBtn.addEventListener("click", async () => {
    const loginId = elements.email.value.trim();
    const email = toAuthEmail(loginId);
    if (!email) {
      elements.authMsg.textContent = "Informe um usuario ou numero valido.";
      elements.authMsg.className = "msg error";
      return;
    }
    const password = elements.password.value;
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      elements.authMsg.textContent = error.message;
      elements.authMsg.className = "msg error";
    }
    });
  }

  if (elements.signupBtn) {
    elements.signupBtn.addEventListener("click", async () => {
    const loginId = elements.email.value.trim();
    const email = toAuthEmail(loginId);
    if (!email) {
      elements.authMsg.textContent = "Informe um usuario ou numero valido.";
      elements.authMsg.className = "msg error";
      return;
    }
    const password = elements.password.value;
    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
    });
    if (error) {
      elements.authMsg.textContent = error.message;
      elements.authMsg.className = "msg error";
    } else {
      elements.authMsg.textContent =
        "Conta criada. Use o usuario e a senha para entrar.";
      elements.authMsg.className = "msg info";
    }
    });
  }

  if (elements.setorSelect) {
    elements.setorSelect.addEventListener("change", (event) => {
    state.setor = event.target.value;
    state.produto = null;
    state.marca = null;
    pushMessage("info", `Setor fixado: ${state.setor}`);
    renderContext();
    renderCountTable();
    });
  }

  if (elements.publicSearch) {
    elements.publicSearch.addEventListener("input", (event) => {
    state.publicQuery = event.target.value;
    renderPublicTable();
    });
  }

  if (elements.publicFilterBtn) {
    elements.publicFilterBtn.addEventListener("click", () => {
      openFilterModal();
    });
  }

  if (elements.filterClose) {
    elements.filterClose.addEventListener("click", closeFilterModal);
  }
  if (elements.filterCloseBtn) {
    elements.filterCloseBtn.addEventListener("click", closeFilterModal);
  }

  if (elements.filterSetor) {
    elements.filterSetor.addEventListener("change", () => {
      updateFilterDependencies();
    });
  }

  if (elements.filterProduto) {
    elements.filterProduto.addEventListener("change", () => {
      setSelectOptions(
        elements.filterMarca,
        listBrands(elements.filterSetor.value, elements.filterProduto.value),
        elements.filterMarca.value
      );
    });
  }

  if (elements.filterApply) {
    elements.filterApply.addEventListener("click", () => {
    state.publicFilters = {
      setor: elements.filterSetor.value,
      produto: elements.filterProduto.value,
      marca: elements.filterMarca.value,
      tipo: elements.filterTipo.value.trim(),
    };
    renderPublicTable();
    closeFilterModal();
    });
  }

  if (elements.filterClear) {
    elements.filterClear.addEventListener("click", () => {
    state.publicFilters = { setor: "", produto: "", marca: "", tipo: "" };
    buildFilterOptions();
    renderPublicTable();
    });
  }

  if (elements.publicRefresh) {
    elements.publicRefresh.addEventListener("click", () => {
      loadPublicRecords();
    });
  }

  if (elements.clearContext) {
    elements.clearContext.addEventListener("click", () => {
    state.produto = null;
    state.marca = null;
    pushMessage("info", "Contexto limpo.");
    renderContext();
    });
  }

  if (elements.processBtn) {
    elements.processBtn.addEventListener("click", () => {
      processCommand(elements.commandInput.value);
    });
  }

  if (elements.commandInput) {
    elements.commandInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        processCommand(elements.commandInput.value);
      }
    });
  }

  if (elements.publicExportBtn) {
    elements.publicExportBtn.addEventListener("click", () => {
      const rows = state.publicRows.filter(matchesPublicFilters);
      exportRows(rows, "estoque_filtro.csv");
    });
  }

  if (elements.countExportBtn) {
    elements.countExportBtn.addEventListener("click", () => {
      const rows = getCountRowsForSetor();
      exportRows(rows, `estoque_${state.setor}.csv`);
    });
  }

  if (elements.countClearBtn) {
    elements.countClearBtn.addEventListener("click", async () => {
      if (state.countMode === "new") {
        const confirmClear = window.confirm(
          `Deseja limpar a nova contagem do setor ${state.setor}?`
        );
        if (!confirmClear) return;
        state.sessionRows = state.sessionRows.filter(
          (row) => row.setor !== state.setor
        );
        renderCountTable();
        pushMessage("success", "Nova contagem limpa para o setor atual.");
        return;
      }

      if (!state.user) return;
      const confirmClear = window.confirm(
        `Deseja apagar todas as contagens do setor ${state.setor}?`
      );
      if (!confirmClear) return;
      const { error } = await supabaseClient
        .from(TABLE_NAME)
        .delete()
        .eq("user_id", state.user.id)
        .eq("setor", state.setor);
      if (error) {
        pushMessage("error", `Erro ao limpar: ${error.message}`);
        return;
      }
      await loadPublicRecords();
      pushMessage("success", "Contagem limpa para o setor atual.");
    });
  }

  if (elements.saveNewCountBtn) {
    elements.saveNewCountBtn.addEventListener("click", saveNewCount);
  }

  if (elements.discardNewCountBtn) {
    elements.discardNewCountBtn.addEventListener("click", discardNewCount);
  }
}

function setupAuth() {
  supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    state.user = session?.user ?? null;
    if (state.user) {
      if (elements.menuUserEmail) {
        elements.menuUserEmail.textContent = displayUserFromEmail(
          state.user.email
        );
      }
      if (elements.menuUser) elements.menuUser.classList.remove("hidden");
      if (elements.menuLogout) elements.menuLogout.classList.remove("hidden");
      if (PAGE_MODE === "edit") {
        hideAuthPanel();
        if (elements.countPanel) elements.countPanel.classList.remove("hidden");
        renderContext();
        renderCountTable();
        updateCountModeUI();
        await loadUserRecords();
      } else {
        hideAuthPanel();
        hideCountPanels();
      }
    } else {
      if (elements.menuUser) elements.menuUser.classList.add("hidden");
      if (elements.menuLogout) elements.menuLogout.classList.add("hidden");
      if (PAGE_MODE === "edit") {
        showAuthPanel();
        hideCountPanels();
        state.userRows = [];
        renderCountTable();
      } else {
        hideAuthPanel();
        hideCountPanels();
      }
    }
  });
}

function initSetorSelects() {
  const setores = Object.keys(CONFIG_GERAL);
  if (elements.setorSelect) {
    elements.setorSelect.innerHTML = "";
    setores.forEach((setor) => {
      const option = document.createElement("option");
      option.value = setor;
      option.textContent = setor;
      elements.setorSelect.appendChild(option);
    });
    elements.setorSelect.value = state.setor;
  }

  if (elements.editSetor) {
    elements.editSetor.innerHTML = "";
    setores.forEach((setor) => {
      const option = document.createElement("option");
      option.value = setor;
      option.textContent = setor;
      elements.editSetor.appendChild(option);
    });
    elements.editSetor.value = state.setor;
  }
}



initSetorSelects();
buildFilterOptions();
renderContext();
renderPublicTable();
renderCountTable();
updateCountModeUI();
setupVoice();
setupEvents();
setupAuth();
loadPublicRecords();
