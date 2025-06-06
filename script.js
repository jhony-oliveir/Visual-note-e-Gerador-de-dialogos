//banco de dados
// ================== CONFIGURAÇÃO ==================
const DB_NAME     = 'MeuEditorDB';
const DB_VERSION  = 1;
const STORE_NAME  = 'saves';
const PRIMARY_KEY = 'id';   // chave primária única
const RECORD_ID   = 'saves';// sempre sobrescrevemos o mesmo registro

// Abre (ou cria) o banco — devolve uma Promise com o objeto `db`
function openDb() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = e => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: PRIMARY_KEY });
            }
        };

        req.onsuccess = () => resolve(req.result);
        req.onerror   = () => reject(req.error);
    });
}

// ================ FUNÇÕES DE ALTO NÍVEL =================
async function salvarSaves(stringHTML) {
    const db = await openDb();

    return new Promise((resolve, reject) => {
        const tx    = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        store.put({ [PRIMARY_KEY]: RECORD_ID, conteudo: stringHTML });

        tx.oncomplete = () => resolve();
        tx.onerror    = () => reject(tx.error);
    });
}

async function carregarSaves() {
    const db = await openDb();

    return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req   = store.get(RECORD_ID);

    req.onsuccess = () => {
        const registro = req.result;
        resolve(registro ? registro.conteudo : null);
    };
        req.onerror = () => reject(req.error);
    });
}

// ================== DEMO COM BOTÕES ==================

async function salvarString(valor) {
    try {
        await salvarSaves(valor);
        //alert("Salvo no IndexedDB 🎉");
    } catch (e) {
        console.error("Falha ao salvar:", e);
    }
}
//carregarString()
async function carregarString() {
try {
    const recebido = await carregarSaves();
    if (recebido !== null) {
        return recebido;          // sobrescreve a variável global
    } else {
        return {};
    }
    } catch (e) {
        console.error("Falha ao carregar:", e);
    }
}

var saves = ''

async function iniciar() {
    saves = await carregarString();
    //saves = JSON.parse( saves );

    var listaDeProjetos = document.getElementById('projetos');

    //adiciona os projetos carregaveis
    Object.keys(saves).forEach((projetoSalvo) =>{
        //console.log(projetoSalvo)
        //projetoSalvo = saves[projetoSalvo]
        var opcao = document.createElement('option');
        opcao.value = projetoSalvo;
        opcao.innerHTML = projetoSalvo;

        listaDeProjetos.prepend(opcao);
        document.querySelector("#projetos").value = ''
    });
    saves = ''
}

iniciar()

var idItem = 0;

//var saves = JSON.parse(localStorage.getItem("saves"))


//if (saves == null){
//    var vazio = {}
//    localStorage.setItem("saves", JSON.stringify(vazio))
//    saves = JSON.parse(localStorage.getItem("saves"));
//}

function deletaNode(elemento){

    var entradas = elemento.parentNode.getElementsByClassName('conectorE')[0]
    entradas = Array.from(entradas.getAttribute('origem').split(" "));
    var saidas = Array.from(elemento.parentNode.getElementsByClassName('nodeSaida'))

    saidas.forEach((saida) => {
        //posicionarLinha(saida);
        retiraLinha(saida);
    });

    entradas.forEach((saida) => {
        if (saida != ''){
            saida = document.getElementById(`saida-${saida}`)
            retiraLinha(saida)
            //posicionarLinha(saida);
        }
    });

    elemento.parentNode.remove()
}
function apagarConectorS(elemento){
    const identificador = elemento.getAttribute('saida-id');

    const linhaDeletar = elemento.parentNode.getElementsByClassName('nodeSaida')[0]
    retiraLinha(linhaDeletar)

    document.getElementById(`separador-${identificador}`).remove()
    elemento.parentNode.remove()
}

function criarConectorS(elemento) {
    const identificador = elemento.getAttribute('node-id');
    const identificadorPorta = parseInt(elemento.getAttribute("saidas"));
    /*const node = document.getElementById(`idItem-${identificador}`)*/

    const nodePorta = `${identificador}-${identificadorPorta}`

    const conectorS = document.createElement('div');
    conectorS.className = 'conectorS';
    conectorS.setAttribute("node-id", identificador);

    const apagar = document.createElement('div');
    apagar.className = 'apagar';
    apagar.setAttribute("saida-id", nodePorta);
    apagar.setAttribute('onmousedown', 'apagarConectorS(this)');

    const conectorSConteudo = document.createElement('textarea');
    conectorSConteudo.className = 'conectorSConteudo formatavel';
    conectorSConteudo.setAttribute('placeholder', ' ');
    conectorSConteudo.setAttribute('contenteditable', 'true');
    conectorSConteudo.setAttribute('onmouseup', 'arrumarLinhasProximas(this.parentElement.parentElement)');

    const nodeSaida = document.createElement('div');
    nodeSaida.className = 'nodeSaidaInvisivel';

    const nodeSaidaVisual = document.createElement('div');
    nodeSaidaVisual.className = 'nodeSaida';
    nodeSaidaVisual.id = `saida-${nodePorta}`
    nodeSaidaVisual.setAttribute("saida-id", nodePorta);
    nodeSaidaVisual.setAttribute("entrada-marcada", "null");

    const linhaLigada = document.createElement('div');
    linhaLigada.className = 'linhaLigada';

    nodeSaidaVisual.appendChild(linhaLigada);
    nodeSaida.appendChild(nodeSaidaVisual);

    conectorS.appendChild(apagar);
    conectorS.appendChild(conectorSConteudo);
    conectorS.appendChild(nodeSaida);

    const separador = document.createElement('div');
    separador.className = 'separadorFL';
    separador.id = `separador-${nodePorta}`

    elemento.parentNode.insertBefore(conectorS, elemento);
    elemento.parentNode.insertBefore(separador, elemento);

    elemento.setAttribute("saidas", `${identificadorPorta + 1}`)
    //return conectorS;
}

function iniciarResize(e) {
    e.preventDefault();

    console.log(e)

    const parent = e.target.parentElement.parentElement;
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = parseInt(getComputedStyle(parent).width, 10);
    const startHeight = parseInt(getComputedStyle(parent).height, 10);

    function onMouseMove(e) {
        parent.style.width = startWidth + (e.clientX - startX) + 'px';
        //parent.style.height = startHeight + (e.clientY - startY) + 'px';

        //reposiciona as linhas
        var saidas = Array.from(parent.getElementsByClassName('nodeSaida'));
        saidas.forEach((saida) => {
            posicionarLinha(saida);
        });
    }


    function onMouseUp() {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    }



    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
}


function criarNode() {
    const node = document.createElement('div');
    node.className = 'node';
    node.id = `idItem-${idItem}`
    node.style.left = '0px';
    node.style.top = '0px';

    const fechar = document.createElement('div');
    fechar.className = 'fechar';
    fechar.setAttribute('onmousedown', 'deletaNode(this)');

    const mover = document.createElement('div');
    mover.className = 'mover formatavel';
    mover.setAttribute('onmousedown', 'moverNode(event)');
    mover.setAttribute('dono', `idItem-${idItem}`);

    const conectorE = document.createElement('div');
    conectorE.className = 'conectorE';
    conectorE.id = `entr-${idItem}`;
    conectorE.setAttribute("node-id", idItem);
    conectorE.setAttribute("origem", "");

    const nodeTitulo = document.createElement('div');
    nodeTitulo.className = 'nodeTitulo formatavel';
    nodeTitulo.setAttribute('contenteditable', 'true');

    // const conectorD = document.createElement('div');
    // conectorD.className = 'conectorD';

    const conteudo = document.createElement('div');
    conteudo.className = 'conteudo';

    const nodeTexto = document.createElement('div');
    nodeTexto.className = 'nodeTexto';

    const textarea = document.createElement('textarea');
    textarea.className = 'formatavel';
    textarea.setAttribute('placeholder', 'Digite o texto aqui');
    textarea.setAttribute('onmouseup', 'arrumarLinhasProximas(this.parentElement.parentElement)');

    const separador = document.createElement('div');
    separador.className = 'separador';

    const addSaida = document.createElement('div');
    addSaida.className = 'addSaida';
    addSaida.setAttribute("node-id", idItem);
    addSaida.setAttribute('onmousedown', 'criarConectorS(this)');
    addSaida.setAttribute("saidas", "0");

    const resizer = document.createElement('div');
    resizer.className = 'resizer';
    resizer.setAttribute('onmousedown', 'iniciarResize(event)');


    nodeTexto.appendChild(textarea);
    conteudo.appendChild(nodeTexto);
    conteudo.appendChild(separador);
    conteudo.appendChild(addSaida);
    conteudo.appendChild(resizer);

    node.appendChild(fechar);
    node.appendChild(mover);
    node.appendChild(conectorE);
    node.appendChild(nodeTitulo);
    // node.appendChild(conectorD); // Comentado como no HTML original
    node.appendChild(conteudo);

    idItem ++

    return node;
}

// Função para criar um novo nó de fala na página
function criarNodeFala() {
    // Mensagem de log para indicar que a função foi chamada
    console.log('Clicando continuamente na div!');

    // Obtém o elemento "corpo" da página
    corpo = document.getElementById("corpo");

    // Insere o HTML do novo nó de fala no final do corpo
    corpo.appendChild(criarNode());
    //corpo.insertAdjacentHTML('beforeend', criarFala());

    // Define o z-index de todos os elementos de fala para 1
    elementos = document.querySelectorAll('.fala');
    elementos.forEach(function(elementoAtual, index) {
        elementoAtual.style.zIndex = 1; 
    });
    salvarEstado()
}

function pegarNumero(str) {
  const match = str.match(/-?\d+(\.\d+)?/);
  if (match) {
    return parseFloat(match[0]);
  }
  return null; // se não encontrar número
}

// Função para mover o nó de fala quando o mouse é arrastado
function moverNode(event) {
    // Obtém o elemento pai do elemento clicado
    var elemento = event.currentTarget.parentNode;
    corpo = document.getElementById("corpo");

    // Define o z-index de todos os elementos de fala para 1
    elementos = document.querySelectorAll('.node');
    elementos.forEach(function(elementoAtual, index) {
        elementoAtual.style.zIndex = 1; 
    });

    var xMInicial = event.clientX;
    var yMInicial = event.clientY;

    // Função chamada quando o mouse é movido
    document.onmousemove = function(event) {
        // Define o z-index do elemento para 2 para colocá-lo na frente dos outros
        elemento.style.zIndex = '2';

        var vwAtual = pegarNumero(elemento.style.left);
        var vhAtual = pegarNumero(elemento.style.top);
        var xMDiferenca = vwAtual + event.clientX - xMInicial;
        var yMDiferenca = vhAtual + event.clientY - yMInicial;
        xMInicial = event.clientX;
        yMInicial = event.clientY;

        if (xMDiferenca < 0){
            xMDiferenca = 0;
        }

        if (yMDiferenca < 0){
            yMDiferenca = 0;
        }

        elemento.style.left = `${xMDiferenca}px`;
        elemento.style.top = `${yMDiferenca}px`;

        // Define o z-index do elemento para 2 novamente
        elemento.style.zIndex = '2';

        var entradas = elemento.getElementsByClassName('conectorE')[0]
        entradas = Array.from(entradas.getAttribute('origem').split(" "));
        var saidas = Array.from(elemento.getElementsByClassName('nodeSaida'))

        saidas.forEach((saida) => {
            posicionarLinha(saida);
        });

        entradas.forEach((saida) => {
            if (saida != ''){
                //console.log(saida)
                saida = document.getElementById(`saida-${saida}`)
                posicionarLinha(saida);
            }
        });


    };

    // Função chamada quando o mouse é solto, encerrando o movimento
    document.onmouseup = function() {
        document.onmousemove = null; // Remove o listener de movimento do mouse
    };
}







var nodeSaidaSelecionado = false;
var nodeEntradaSelecionado = false;

// guarda saída selecionada a partir de node
function nodeSaida() {
    //var texto = $(this).text();
    nodeSaidaSelecionado = $(this);
}
$(document).on('mousedown', '.ligarS', nodeSaida);

//adiciona node de entrada caso mouse fique de cima
function nodeEntrada() {
    nodeEntradaSelecionado = $(this);
}
$(document).on('mouseover', '.ligarE', nodeEntrada);

//remove node de entrada caso mouse saia de cima
function nodeEntradaS() {
    nodeEntradaSelecionado = false;
}
$(document).on('mouseout', '.ligarE', nodeEntradaS);

$(document).on('mouseup', function() {
    if (nodeSaidaSelecionado != false){
        console.log('Mouse foi solto');
        // faz a combinação de entrada e saída de node
        if(nodeEntradaSelecionado != false){
            console.log(nodeEntradaSelecionado)
            console.log(" e ")
            console.log(nodeSaidaSelecionado)
        }
        else{
            console.log("nenhuma combinação")
        }
        console.log('');
        // remove saída selecionada a partir de node
        nodeSaidaSelecionado = false;
    }
});











function distanciaEntreElementos(el1, el2) {
    const r1 = el1.getBoundingClientRect();
    const r2 = el2.getBoundingClientRect();

    // Coordenadas do centro de cada elemento
    const x1 = r1.left + r1.width / 2;
    const y1 = r1.top + r1.height / 2;

    const x2 = r2.left + r2.width / 2;
    const y2 = r2.top + r2.height / 2;

    // Distância Euclidiana (linha reta)
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}

function rotacaoEntreElementos(el1, el2) {
    const r1 = el1.getBoundingClientRect();
    const r2 = el2.getBoundingClientRect();

    // Centro de el1
    const x1 = r1.left + r1.width / 2;
    const y1 = r1.top + r1.height / 2;

    // Centro de el2
    const x2 = r2.left + r2.width / 2;
    const y2 = r2.top + r2.height / 2;

    // Diferença entre as posições
    const dx = x2 - x1;
    const dy = y2 - y1;

    // Ângulo em radianos → depois convertido para graus
    const rad = Math.atan2(dy, dx);
    const graus = rad * (180 / Math.PI);

    return graus;
}

function arrumarLinhasProximas(event){
    var saidas = Array.from(event.getElementsByClassName('nodeSaida'))
    console.log('saiu')

    saidas.forEach((saida) => {
        posicionarLinha(saida);
        console.log('saiu')
    });
}

function arrumarLinhasTextArea(event){
    var saidas = Array.from(elemento.getElementsByClassName('nodeSaida'))
    console.log('saiu')

    saidas.forEach((saida) => {
        posicionarLinha(saida);
        console.log('saiu')
    });
}

function posicionarLinha(origem){
    const destino = document.getElementById(origem.getAttribute('entrada-marcada'))
    if (destino){
        const linha = origem.getElementsByClassName('linhaLigada')[0]
        const angulo = rotacaoEntreElementos(origem, destino)
        const largura = distanciaEntreElementos(origem, destino)

        linha.style.transform = `rotate(${angulo}deg)`;
        linha.style.width = `${largura}px`
        linha.style.zIndex = '0'
    }
}

function posicionarLinhaMouse(origem){

    //console.log(origem[0])
    origem = origem[0].getElementsByClassName('linhaLigada')[0]
    
    const rect = origem.getBoundingClientRect();

    // Centro do elemento origem
    const origemX = rect.left + rect.width / 2;
    const origemY = rect.top + rect.height / 2;

    // Posição do mouse
    //const mouseX = mouseX//event.clientX;
    //const mouseY = mouseY//event.clientY;

    // Diferença
    const dx = mouseX - origemX;
    const dy = mouseY - origemY;

    // Ângulo em graus
    const angulo = Math.atan2(dy, dx) * (180 / Math.PI);

    // Distância
    const largura = Math.sqrt(dx * dx + dy * dy) * 1.9;
    //console.log(largura)

    //const linha = origem.getElementsByClassName('linhaLigada')[0]
    origem.style.transform = `rotate(${angulo}deg)`;
    origem.style.width = `${largura}px`
}

function retiraLinha(elemento){
    const entradaMarcada = elemento.getAttribute('entrada-marcada')
    const entradaMarcadaDiv = document.getElementById(entradaMarcada)
    if (entradaMarcadaDiv != null){
        const saidaMarcadaOrigens = entradaMarcadaDiv.getAttribute('origem')
        entradaMarcadaDiv.setAttribute('origem', saidaMarcadaOrigens.replace(` ${elemento.getAttribute('saida-id')}`,''))
    }
    elemento.setAttribute('entrada-marcada', 'null')

    //console.log(elemento)

    elemento.getElementsByClassName('linhaLigada')[0].style.width = '0px'
}

$(window).on('resize', function() {
    const saidas = Array.from( document.getElementsByClassName('nodeSaida') )

    saidas.forEach(saida => {
        posicionarLinha(saida)
    })
});

var mouseX = null
var mouseY = null

document.addEventListener('mousemove', function(event) {
    mouseX = event.clientX;  // Horizontal position of the mouse
    mouseY = event.clientY;  // Vertical position of the mouse
});

function loopEnquantoPressionado() {
    if (nodeSaidaClicado) {
        posicionarLinhaMouse(nodeSaidaClicado)
        // Você pode fazer o que quiser aqui
    }
    requestAnimationFrame(loopEnquantoPressionado); // roda a cada frame (~60fps)
}

var nodeSaidaClicado = null;
var nodeEntradaOver = null;


function clicouSaida(){
    nodeSaidaClicado = $(this);
    //console.log(`Selecionou ${ nodeSaidaClicado[0].getAttribute('saida-id') }`);
}

function soltouEmAlgo(){
    if (nodeEntradaOver && nodeSaidaClicado){
        nodeSaidaClicado[0].setAttribute('entrada-marcada', nodeEntradaOver[0].id)
        const origemValue = nodeEntradaOver[0].getAttribute('origem')
        const saidaValue = nodeSaidaClicado[0].getAttribute('saida-id')
        if (    origemValue.includes(saidaValue)    ){
            console.log("Já possuí")
        }
        else {
            nodeEntradaOver[0].setAttribute('origem', `${origemValue} ${saidaValue}`)
        }
        posicionarLinha(nodeSaidaClicado[0])
    }
    else{
        if (nodeSaidaClicado) {
            //porta de entrada id
            const entradaMarcada = nodeSaidaClicado[0].getAttribute('entrada-marcada')
            if ( entradaMarcada != 'null' ){
                //porta de entrada atributo
                //  const entradaMarcadaDiv = document.getElementById(entradaMarcada)
                //  const saidaMarcadaOrigens = entradaMarcadaDiv.getAttribute('origem')
                //retira o identificador da saida que está na entrada
                retiraLinha(nodeSaidaClicado[0])
                //  entradaMarcadaDiv.setAttribute('origem', saidaMarcadaOrigens.replace(` ${nodeSaidaClicado[0].getAttribute('saida-id')}`,''))
                //  nodeSaidaClicado[0].setAttribute('entrada-marcada', 'null')
                //const linha = nodeSaidaClicado[0].getElementsByClassName('linhaLigada')[0]
                //linha.style.width = '0px'
                //console.log(entradaMarcada)
            }
            const linha = nodeSaidaClicado[0].getElementsByClassName('linhaLigada')[0]
            linha.style.width = '0px'
        }
    }
    nodeSaidaClicado = null;
}

function nodeEntradaOverf(event){
    nodeEntradaOver = $(this);
    //console.log('teste')
}

function nodeEntradaOut(event){
    nodeEntradaOver = null;
}


document.addEventListener('mouseup', soltouEmAlgo);

//soltouEmAlgo
$(document).on('mousedown', '.nodeSaida', clicouSaida);
//$(document).on('mousedown', '.nodeSaida', loopEnquantoPressionado);
loopEnquantoPressionado()

$(document).on('mouseover', '.conectorE', nodeEntradaOverf);

$(document).on('mouseout', '.conectorE', nodeEntradaOut);


function substituirTextareasPorTexto() {
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    const texto = textarea.value;
    textarea.textContent = texto; // coloca o conteúdo entre as tags <textarea>...</textarea>
  });
}


var corpo = document.getElementById('corpo');

let historico = [corpo.innerHTML];
let indiceAtual = 0;
let debounceTimer = null;
const debounceDelay = 1;
let ultimoConteudoSalvo = corpo.innerHTML;

// Salva estado só se for diferente do anterior
function salvarEstado() {
  const conteudoAtual = corpo.innerHTML;

  substituirTextareasPorTexto()

  if (conteudoAtual !== ultimoConteudoSalvo) {
    historico = historico.slice(0, indiceAtual + 1);
    historico.push(conteudoAtual);
    indiceAtual++;
    ultimoConteudoSalvo = conteudoAtual;
    // console.log('Estado salvo', indiceAtual);
  }
}

// Salva o estado inicial
//salvarEstado();

// Undo e Redo
function undo() {
  if (indiceAtual > 0) {
    indiceAtual--;
    corpo.innerHTML = historico[indiceAtual];
    ultimoConteudoSalvo = corpo.innerHTML;
  }
}

function redo() {
  if (indiceAtual < historico.length - 1) {
    indiceAtual++;
    corpo.innerHTML = historico[indiceAtual];
    ultimoConteudoSalvo = corpo.innerHTML;
  }
}

// Teclas Ctrl+Z e Ctrl+Y
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === 'z') {
    undo();
    e.preventDefault();
  } else if (e.ctrlKey && e.key.toLowerCase() === 'y') {
    redo();
    e.preventDefault();
  }
});

// MutationObserver com debounce
corpo.addEventListener('mouseup', () => {
  salvarEstado();
});



let corpoMiddleScroll_active = false;
let corpoMiddleScroll_startX = 0;
let corpoMiddleScroll_startY = 0;
let corpoMiddleScroll_scrollLeft = 0;
let corpoMiddleScroll_scrollTop = 0;

corpo.addEventListener('mousedown', (e) => {
    if (e.button === 1) {
        e.preventDefault();
        corpoMiddleScroll_active = true;
        corpoMiddleScroll_startX = e.clientX;
        corpoMiddleScroll_startY = e.clientY;
        corpoMiddleScroll_scrollLeft = corpo.scrollLeft;
        corpoMiddleScroll_scrollTop = corpo.scrollTop;
        corpo.style.cursor = 'grabbing';
    }
});

document.addEventListener('mousemove', (e) => {
    if (!corpoMiddleScroll_active) return;

    const dx = e.clientX - corpoMiddleScroll_startX;
    const dy = e.clientY - corpoMiddleScroll_startY;
    corpo.scrollLeft = corpoMiddleScroll_scrollLeft - dx;
    corpo.scrollTop = corpoMiddleScroll_scrollTop - dy;

});

document.addEventListener('mouseup', (e) => {
    if (e.button === 1 && corpoMiddleScroll_active) {
        corpoMiddleScroll_active = false;
        corpo.style.cursor = 'default';
    }
});




//color picker

const pickr1 = Pickr.create({
    el: '#colorPicker1',
    theme: 'classic', // ou 'monolith', 'nano'
    default: '#ff0000', // Cor inicial
    swatches: [
        '#575757',
        '#646464',
    ],
    components: {
    preview: true,
    opacity: true,
    hue: true,
        interaction: {
        hex: true,
        rgba: true,
        input: true,
        clear: true,
        save: true
        }
    }

    
});

const pickr2 = Pickr.create({
    el: '#colorPicker2',
    theme: 'classic', // ou 'monolith', 'nano'
    default: '#ff0000', // Cor inicial
    swatches: [
        '#575757',
        '#646464',
    ],
    components: {
    preview: true,
    opacity: true,
    hue: true,
        interaction: {
        hex: true,
        rgba: true,
        input: true,
        clear: true,
        save: true
        }
    }
});

var formatavelSelecionado = null

pickr1.on('save', (color) => {
    if (formatavelSelecionado){
        formatavelSelecionado.style.backgroundColor = color.toHEXA().toString();
    }
});

pickr2.on('save', (color) => {
    if (formatavelSelecionado){
        formatavelSelecionado.style.color = color.toHEXA().toString();
    }
});

$(document).on('mousedown', '.formatavel', function() {
    if (this.getAttribute('dono')){
        formatavelSelecionado = document.getElementById(this.getAttribute('dono'));
    }
    else{
        formatavelSelecionado = this;
    }
});


async function salvar(){
    substituirTextareasPorTexto()

    if(document.getElementById("titulo").innerHTML != ''){
        saves = await carregarString();

        if (saves[document.getElementById("titulo").innerHTML] != null){
            document.querySelector(`#projetos option[value='${document.getElementById("titulo").innerHTML}']`).remove()
        }

        var opcaoNova = document.createElement('option');
        opcaoNova.value = document.getElementById("titulo").innerHTML;
        opcaoNova.innerHTML = document.getElementById("titulo").innerHTML;
        document.getElementById('projetos').prepend(opcaoNova);

        var salvarTudo = [
            //nome
            document.getElementById("titulo").innerHTML,
            //contador de nodes
            idItem,
            //conteudo
            document.getElementById("corpo").innerHTML,
        ]

        delete saves[document.getElementById("titulo").innerHTML];
        saves[document.getElementById("titulo").innerHTML] = salvarTudo;

        //localStorage.setItem("saves", JSON.stringify(saves));
        salvarString(saves)

        saves = ''
        document.querySelector("#projetos").value = ''

        alert('Salvo com sucesso');
    }
    else{
        alert('Adicione um titulo');
    }
}

async function carregar(selector){
    saves = await carregarString();
    var titulo = saves[selector.value]
    document.getElementById("titulo").innerHTML = titulo[0]
    idItem = titulo[1]
    document.getElementById("corpo").innerHTML = titulo[2]
    selector.value = ''
    historico = [corpo.innerHTML]
    ultimoConteudoSalvo = corpo.innerHTML
    indiceAtual = 0
    saves = ''
}

async function apagarSave(){
    saves = await carregarString();
    delete saves[document.getElementById("titulo").innerHTML];
    //localStorage.setItem("saves", JSON.stringify(saves));
    salvarString(saves)
    saves = ''
    location.reload();
}

function baixarObjetoComoTxt(obj, nomeArquivo = "dados.txt") {
    const texto = JSON.stringify(obj, null, 2); // Transforma o objeto em texto formatado
    const blob = new Blob([texto], { type: "text/plain" });
    const link = document.createElement("a");
    
    link.href = URL.createObjectURL(blob);
    link.download = nomeArquivo;
    link.click();

    // Libera o recurso de memória depois
    URL.revokeObjectURL(link.href);
}


function pegarSaidasDialogo(dialogos) {
    dialogosLista = [];
    dialogos = Array.from(dialogos);
    dialogos.forEach((dialogo) => {
        identificador = dialogo.getElementsByClassName('apagar')[0].getAttribute('saida-id');
        resposta = dialogo.getElementsByClassName('conectorSConteudo')[0].value;
        to = dialogo.getElementsByClassName('nodeSaida')[0].getAttribute('entrada-marcada');
        dialogoObj = {
            id : identificador,
            resposta : resposta,
            to : to,
        }
        dialogosLista.push(dialogoObj);
    })
    return dialogosLista;
}

function pegarEntradasDialogo(entrada){
    nomes = entrada.getAttribute('origem');
    enderecos = nomes.split(' ');

    if (enderecos != '' && enderecos != null) {
        enderecos = enderecos.filter(item => item !== '');
    }
    return enderecos;
}

function baixarDialogos(){
    nodes = document.getElementsByClassName('node');

    dialogos = {}
    nodes = Array.from(nodes);
    nodes.forEach((node) => {
        nodeSaidas = node.getElementsByClassName('conectorS');
        entrada = node.getElementsByClassName('conectorE')[0];
        dialogo = {
            id : node.id,
            from : pegarEntradasDialogo(entrada),
            dialogo : node.querySelector('.nodeTexto textarea').value,
            saidas : pegarSaidasDialogo(nodeSaidas)
        }
        dialogos[node.id] = dialogo;
    })

    nomeArquivo = document.querySelector("#titulo").innerHTML
    if (nomeArquivo == '' || nomeArquivo == null || nomeArquivo == '<br>'){
        nomeArquivo = 'dados.txt'
    }
    else {
        nomeArquivo = `${nomeArquivo}.txt`
    }
    baixarObjetoComoTxt(dialogos, nomeArquivo);
}