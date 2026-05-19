const canva = document.getElementById("canva");
const contexto = canva.getContext("2d");

const menu = document.getElementById("menu");
const tela_jogo = document.getElementById("jogo");
const tela_gameover = document.getElementById("tela_gameover");

const botao_comecar = document.getElementById("botao_comecar");
const botao_reiniciar = document.getElementById("botao_reiniciar");
const botao_voltar = document.getElementById("botao_voltar");
const titulo_gameover = document.querySelector("#tela_gameover h2");

const titulo_pontuacao = document.getElementById("pontuacao");
const musica_menu = document.getElementById("menuAudio");
const musica_jogo = document.getElementById("jogoAudio");
const modos_jogo = document.querySelectorAll('input[name="modoJogo"]');
const titulo_pontuacaoMax = document.getElementById("pontuacaoMax");

const tamanhoBloco = 20;
const quantidadeBlocos = 20;
const pontuacaoCoberturaTotal = 397;

let cobra;
let direcao;
let proximaDirecao;
let macas;
let gameLoop;
let pontuacao;
let metaPontos;
let fimDeJogo;
let modoSelecionado = "tradicional";

let modoRoxo = false;
let modoCrush = false;
let macasRoxas = [];
let blocosBorda = [];
let ultimoResultadoFoiVitoria = false;
let envenenada = false;
let audioAtual = null;

const painel_modoEx = document.getElementById("painel_modoEx");
const botao_modoRoxo = document.getElementById("botao_roxo");
const botao_modoCrush = document.getElementById("botao_crush");
const botao_semModo = document.getElementById("botao_semModo");

modos_jogo.forEach(opcao => {
  opcao.addEventListener("change", () => {
    modoSelecionado = opcao.value;
  });
});

botao_comecar.addEventListener("click", () => novoJogo(true));
botao_reiniciar.addEventListener("click", reiniciarPartida);
botao_voltar.addEventListener("click", voltarAoMenu);

window.addEventListener("load", () => {
  tocarMusicaMenu();
  document.body.addEventListener("pointerdown", () => {
    tocarMusicaMenu();
  }, { once: true });
});

botao_modoRoxo.addEventListener("click", () => {
  modoRoxo = true;
  esconderModoEx();
  novoJogo();
});

botao_modoCrush.addEventListener("click", () => {
  modoCrush = true;
  esconderModoEx();
  novoJogo();
});

botao_semModo.addEventListener("click", () => {
  esconderModoEx();
  novoJogo();
});

function novoJogo(redefinirModos = false) {
  if (redefinirModos) {
    modoRoxo = false;
    modoCrush = false;
  }

  clearInterval(gameLoop);

  menu.classList.add("hidden");
  tela_jogo.classList.remove("hidden");
  tela_gameover.classList.add("hidden");

  tocarMusicaJogo();

  cobra = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];

  direcao = "RIGHT";
  proximaDirecao = "RIGHT";
  fimDeJogo = false;
  ultimoResultadoFoiVitoria = false;
  envenenada = false;

  pontuacao = 0;
  metaPontos = modoSelecionado === "limite45" ? 45 : pontuacaoCoberturaTotal;

  titulo_pontuacao.textContent = pontuacao;
  if (titulo_pontuacaoMax) {
    titulo_pontuacaoMax.textContent = metaPontos;
  }

  macas = [];
  macasRoxas = [];
  blocosBorda = [];

  for (let i = 0; i < 1; i++) {
    macas.push(gerarMaca());
  }

  if (modoRoxo) {
    for (let i = 0; i < macas.length; i++) {
      macasRoxas.push(gerarMacaRoxa());
    }
  }

  document.removeEventListener("keydown", mudarDirecao);
  document.addEventListener("keydown", mudarDirecao);

  gameLoop = setInterval(update, 120);
}

function voltarAoMenu() {
  clearInterval(gameLoop);
  fimDeJogo = false;
  tela_jogo.classList.add("hidden");
  tela_gameover.classList.add("hidden");
  menu.classList.remove("hidden");
  document.removeEventListener("keydown", mudarDirecao);
  tocarMusicaMenu();
}

function exibirModoEx() {
  if (!painel_modoEx) return;
  botao_modoRoxo.style.display = modoRoxo ? "none" : "inline-block";
  botao_modoCrush.style.display = modoCrush ? "none" : "inline-block";
  painel_modoEx.classList.remove("hidden");
}

function esconderModoEx() {
  if (!painel_modoEx) return;
  painel_modoEx.classList.add("hidden");
}

function reiniciarPartida() {
  if (ultimoResultadoFoiVitoria && !(modoRoxo && modoCrush)) {
    exibirModoEx();
  } else {
    novoJogo();
  }
}

function tocarMusicaMenu() {
  if (!musica_menu) return;
  if (audioAtual === musica_menu && !musica_menu.paused) return;

  if (audioAtual && audioAtual !== musica_menu) {
    audioAtual.pause();
  }

  audioAtual = musica_menu;

  if (musica_menu.paused) {
    musica_menu.play().catch(() => {});
  }
}

function tocarMusicaJogo() {
  if (!musica_jogo) return;
  if (audioAtual === musica_jogo && !musica_jogo.paused) return;

  if (audioAtual && audioAtual !== musica_jogo) {
    audioAtual.pause();
  }

  audioAtual = musica_jogo;

  if (musica_jogo.paused) {
    musica_jogo.play().catch(() => {});
  }
}

function mudarDirecao(event) {
  const tecla = event.key;

  if (tecla === "ArrowUp" && direcao !== "DOWN") {
    proximaDirecao = "UP";
  }

  if (tecla === "ArrowDown" && direcao !== "UP") {
    proximaDirecao = "DOWN";
  }

  if (tecla === "ArrowLeft" && direcao !== "RIGHT") {
    proximaDirecao = "LEFT";
  }

  if (tecla === "ArrowRight" && direcao !== "LEFT") {
    proximaDirecao = "RIGHT";
  }
}

function verificarPosicao(x, y) {
  const direcoes = [
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 }
  ];

  for (let dir of direcoes) {
    const nx = x + dir.dx;
    const ny = y + dir.dy;
    if (blocosBorda.some(bloco => bloco.x === nx && bloco.y === ny)) {
      return true;
    }
  }

  return false;
}

function gerarMaca() {
  let novaMaca;

  do {
    novaMaca = {
      x: Math.floor(Math.random() * quantidadeBlocos),
      y: Math.floor(Math.random() * quantidadeBlocos)
    };
  } while (
    cobra.some(parte => parte.x === novaMaca.x && parte.y === novaMaca.y) ||
    macas.some(maca => maca.x === novaMaca.x && maca.y === novaMaca.y) ||
    macasRoxas.some(maca => maca.x === novaMaca.x && maca.y === novaMaca.y) ||
    blocosBorda.some(bloco => bloco.x === novaMaca.x && bloco.y === novaMaca.y) ||
    (modoCrush && verificarPosicao(novaMaca.x, novaMaca.y))
  );

  return novaMaca;
}

function gerarMacaRoxa() {
  let novaMaca;

  do {
    novaMaca = {
      x: Math.floor(Math.random() * quantidadeBlocos),
      y: Math.floor(Math.random() * quantidadeBlocos)
    };
  } while (
    cobra.some(parte => parte.x === novaMaca.x && parte.y === novaMaca.y) ||
    macas.some(maca => maca.x === novaMaca.x && maca.y === novaMaca.y) ||
    macasRoxas.some(maca => maca.x === novaMaca.x && maca.y === novaMaca.y) ||
    blocosBorda.some(bloco => bloco.x === novaMaca.x && bloco.y === novaMaca.y) ||
    (modoCrush && verificarPosicao(novaMaca.x, novaMaca.y))
  );

  return novaMaca;
}

function telaResultados(mensagem) {
  clearInterval(gameLoop);
  document.removeEventListener("keydown", mudarDirecao);
  titulo_gameover.textContent = mensagem;
  tela_gameover.classList.remove("hidden");
}

function finalizarDerrota() {
  fimDeJogo = true;
  telaResultados("Fim de Jogo!");
  draw();
}

function finalizarVitoria(mensagem = "Bom trabalho!") {
  fimDeJogo = false;
  ultimoResultadoFoiVitoria = true;
  telaResultados(mensagem);
}

function addBorderBlock() {
  const candidatos = [];

  for (let x = 0; x < quantidadeBlocos; x++) {
    for (let y = 0; y < quantidadeBlocos; y++) {
      if (x === 0 || x === quantidadeBlocos - 1 || y === 0 || y === quantidadeBlocos - 1) {
        candidatos.push({ x, y });
      }
    }
  }

  const disponiveis = candidatos.filter(posicao =>
    !blocosBorda.some(bloco => bloco.x === posicao.x && bloco.y === posicao.y) &&
    !cobra.some(parte => parte.x === posicao.x && parte.y === posicao.y) &&
    !macas.some(maca => maca.x === posicao.x && maca.y === posicao.y) &&
    !macasRoxas.some(maca => maca.x === posicao.x && maca.y === posicao.y)
  );

  if (disponiveis.length === 0) return;

  const escolhido = disponiveis[Math.floor(Math.random() * disponiveis.length)];
  blocosBorda.push(escolhido);
}

function desenharBlocosBorda() {
  if (!blocosBorda || blocosBorda.length === 0) return;

  contexto.fillStyle = "#555";
  for (let bloco of blocosBorda) {
    contexto.fillRect(bloco.x * tamanhoBloco, bloco.y * tamanhoBloco, tamanhoBloco, tamanhoBloco);
  }
}

function desenharMacas() {
  for (let maca of macas) {
    const centroX = maca.x * tamanhoBloco + tamanhoBloco / 2;
    const centroY = maca.y * tamanhoBloco + tamanhoBloco / 2;

    contexto.fillStyle = "red";
    contexto.beginPath();
    contexto.arc(centroX, centroY, 8, 0, Math.PI * 2);
    contexto.fill();

    contexto.fillStyle = "green";
    contexto.beginPath();
    contexto.moveTo(centroX - 2, centroY - 8);
    contexto.lineTo(centroX + 2, centroY - 8);
    contexto.lineTo(centroX, centroY - 12);
    contexto.closePath();
    contexto.fill();
  }

  if (modoRoxo) {
    for (let maca of macasRoxas) {
      const cx = maca.x * tamanhoBloco + tamanhoBloco / 2;
      const cy = maca.y * tamanhoBloco + tamanhoBloco / 2;

      contexto.fillStyle = "purple";
      contexto.beginPath();
      contexto.arc(cx, cy, 8, 0, Math.PI * 2);
      contexto.fill();

      contexto.fillStyle = "#2ecc71";
      contexto.beginPath();
      contexto.moveTo(cx - 2, cy - 8);
      contexto.lineTo(cx + 2, cy - 8);
      contexto.lineTo(cx, cy - 12);
      contexto.closePath();
      contexto.fill();
    }
  }
}

function desenharCabeca(cabeca, pescoco) {
  const dirX = cabeca.x - pescoco.x;
  const dirY = cabeca.y - pescoco.y;

  contexto.save();
  contexto.translate(cabeca.x * tamanhoBloco + tamanhoBloco / 2, cabeca.y * tamanhoBloco + tamanhoBloco / 2);
  contexto.rotate(Math.atan2(dirY, dirX));

  contexto.fillStyle = envenenada ? "#5b405c" : "#2ecc71";

  contexto.fillRect(-tamanhoBloco / 2, -tamanhoBloco / 2, tamanhoBloco / 2, tamanhoBloco);
  contexto.beginPath();
  contexto.arc(0, 0, tamanhoBloco / 2, -Math.PI / 2, Math.PI / 2);
  contexto.fill();

  const raioOlho = 4;
  const deslocamentoOlhoX = tamanhoBloco / 4;
  const deslocamentoOlhoY = tamanhoBloco / 2 - 2;

  if (!fimDeJogo) {
    contexto.fillStyle = "white";
    contexto.beginPath();
    contexto.arc(deslocamentoOlhoX + raioOlho, -deslocamentoOlhoY + raioOlho, raioOlho, 0, Math.PI * 2);
    contexto.fill();
    contexto.beginPath();
    contexto.arc(deslocamentoOlhoX + raioOlho, deslocamentoOlhoY - raioOlho, raioOlho, 0, Math.PI * 2);
    contexto.fill();

    contexto.fillStyle = "black";
    contexto.beginPath();
    contexto.arc(deslocamentoOlhoX + raioOlho, -deslocamentoOlhoY + raioOlho, 2, 0, Math.PI * 2);
    contexto.fill();
    contexto.beginPath();
    contexto.arc(deslocamentoOlhoX + raioOlho, deslocamentoOlhoY - raioOlho, 2, 0, Math.PI * 2);
    contexto.fill();
  } else {
    contexto.fillStyle = "white";
    const centroOlhoX = deslocamentoOlhoX + raioOlho;
    const centroOlhoTopo = -deslocamentoOlhoY + raioOlho;
    const centroOlhoBaixo = deslocamentoOlhoY - raioOlho;

    contexto.beginPath();
    contexto.arc(centroOlhoX, centroOlhoTopo, raioOlho, 0, Math.PI * 2);
    contexto.fill();
    contexto.beginPath();
    contexto.arc(centroOlhoX, centroOlhoBaixo, raioOlho, 0, Math.PI * 2);
    contexto.fill();

    contexto.strokeStyle = "black";
    contexto.lineWidth = 2;
    contexto.beginPath();
    contexto.moveTo(centroOlhoX - 3, centroOlhoTopo - 3);
    contexto.lineTo(centroOlhoX + 3, centroOlhoTopo + 3);
    contexto.moveTo(centroOlhoX + 3, centroOlhoTopo - 3);
    contexto.lineTo(centroOlhoX - 3, centroOlhoTopo + 3);
    contexto.moveTo(centroOlhoX - 3, centroOlhoBaixo - 3);
    contexto.lineTo(centroOlhoX + 3, centroOlhoBaixo + 3);
    contexto.moveTo(centroOlhoX + 3, centroOlhoBaixo - 3);
    contexto.lineTo(centroOlhoX - 3, centroOlhoBaixo + 3);
    contexto.stroke();
  }

  contexto.restore();
}

function desenharCorpo(corpo) {
  contexto.fillStyle = envenenada ? "#5b405c" : "#27ae60";
  contexto.fillRect(corpo.x * tamanhoBloco, corpo.y * tamanhoBloco, tamanhoBloco, tamanhoBloco);
}

function desenharCurva(curva, anterior, proxima) {
  contexto.save();
  contexto.translate(curva.x * tamanhoBloco + tamanhoBloco / 2, curva.y * tamanhoBloco + tamanhoBloco / 2);

  const entradaX = curva.x - anterior.x;
  const entradaY = curva.y - anterior.y;
  const saidaX = proxima.x - curva.x;
  const saidaY = proxima.y - curva.y;

  let rotacao = 0;

  if (entradaX === 1 && saidaY === 1) rotacao = 0;
  if (entradaX === -1 && saidaY === -1) rotacao = Math.PI;
  if (entradaX === 1 && saidaY === -1) rotacao = Math.PI / 2;
  if (entradaX === -1 && saidaY === 1) rotacao = (Math.PI * 3) / 2;

  if (entradaY === 1 && saidaX === 1) rotacao = (Math.PI * 3) / 2;
  if (entradaY === -1 && saidaX === -1) rotacao = Math.PI / 2;
  if (entradaY === 1 && saidaX === -1) rotacao = 0;
  if (entradaY === -1 && saidaX === 1) rotacao = Math.PI;

  contexto.rotate(rotacao);

  contexto.fillStyle = envenenada ? "#5b405c" : "#27ae60";
  contexto.fillRect(-tamanhoBloco / 2, -tamanhoBloco / 2, tamanhoBloco, tamanhoBloco);

  contexto.fillStyle = envenenada ? "#3d2a3c" : "#229954";
  contexto.fillRect(-tamanhoBloco / 2, 0, tamanhoBloco, tamanhoBloco / 2);

  contexto.restore();
}

function desenharRabo(rabo, pai) {
  const dirX = rabo.x - pai.x;
  const dirY = rabo.y - pai.y;

  contexto.save();
  contexto.translate(rabo.x * tamanhoBloco + tamanhoBloco / 2, rabo.y * tamanhoBloco + tamanhoBloco / 2);
  contexto.rotate(Math.atan2(dirY, dirX));

  contexto.fillStyle = envenenada ? "#5b405c" : "#27ae60";

  contexto.beginPath();
  contexto.moveTo(tamanhoBloco / 2, 0);
  contexto.lineTo(-tamanhoBloco / 2, -tamanhoBloco / 2);
  contexto.lineTo(-tamanhoBloco / 2, tamanhoBloco / 2);
  contexto.closePath();
  contexto.fill();

  contexto.fillStyle = envenenada ? "#3d2a3c" : "#229954";
  contexto.beginPath();
  contexto.moveTo(0, 0);
  contexto.lineTo(-tamanhoBloco / 2, -tamanhoBloco / 2);
  contexto.lineTo(-tamanhoBloco / 2, tamanhoBloco / 2);
  contexto.closePath();
  contexto.fill();

  contexto.restore();
}

function update() {
  direcao = proximaDirecao;

  const cabeca = {
    x: cobra[0].x,
    y: cobra[0].y
  };

  if (direcao === "RIGHT") cabeca.x++;
  if (direcao === "LEFT") cabeca.x--;
  if (direcao === "UP") cabeca.y--;
  if (direcao === "DOWN") cabeca.y++;

  if (
    cabeca.x < 0 ||
    cabeca.x >= quantidadeBlocos ||
    cabeca.y < 0 ||
    cabeca.y >= quantidadeBlocos
  ) {
    finalizarDerrota();
    return;
  }

  for (let i = 0; i < cobra.length; i++) {
    if (cabeca.x === cobra[i].x && cabeca.y === cobra[i].y) {
      finalizarDerrota();
      return;
    }
  }

  if (modoCrush) {
    for (let bloco of blocosBorda) {
      if (cabeca.x === bloco.x && cabeca.y === bloco.y) {
        finalizarDerrota();
        return;
      }
    }
  }

  cobra.unshift(cabeca);

  let macaComida = -1;
  for (let i = 0; i < macas.length; i++) {
    if (cabeca.x === macas[i].x && cabeca.y === macas[i].y) {
      macaComida = i;
      break;
    }
  }

  if (modoRoxo) {
    for (let maca of macasRoxas) {
      if (cabeca.x === maca.x && cabeca.y === maca.y) {
        envenenada = true;
        finalizarDerrota();
        return;
      }
    }
  }

  if (macaComida !== -1) {
    pontuacao++;
    titulo_pontuacao.textContent = pontuacao;

    if (pontuacao >= metaPontos) {
      finalizarVitoria(modoSelecionado === "limite45" ? "Limite de 45 pontos alcançado!" : "Bom trabalho!");
      return;
    }

    macas.splice(macaComida, 1);
    macas.push(gerarMaca());

    if (modoRoxo) {
      macasRoxas.splice(macaComida, 1);
      macasRoxas.push(gerarMacaRoxa());
    }

    const quantidadeDesejada = Math.floor(pontuacao / 10) + 1;
    while (macas.length < quantidadeDesejada) {
      macas.push(gerarMaca());
      if (modoRoxo) macasRoxas.push(gerarMacaRoxa());
    }

    if (modoCrush) {
      const blocosParaAdicionar = Math.pow(2, Math.floor(pontuacao / 10));
      for (let i = 0; i < blocosParaAdicionar; i++) {
        addBorderBlock();
      }
    }
  } else {
    cobra.pop();
  }

  draw();
}

function draw() {
  contexto.clearRect(0, 0, canva.width, canva.height);

  desenharBlocosBorda();
  desenharMacas();

  for (let i = 0; i < cobra.length; i++) {
    const atual = cobra[i];

    if (i === 0) {
      desenharCabeca(atual, cobra[i + 1]);
      continue;
    }

    if (i === cobra.length - 1) {
      desenharRabo(atual, cobra[i - 1]);
      continue;
    }

    const anterior = cobra[i - 1];
    const proxima = cobra[i + 1];

    const reto = (
      anterior.x === proxima.x ||
      anterior.y === proxima.y
    );

    if (reto) {
      desenharCorpo(atual, anterior, proxima);
    } else {
      desenharCurva(atual, anterior, proxima);
    }
  }
}