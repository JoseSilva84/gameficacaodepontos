// Importando corretamente os módulos do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, collection, getDocs, updateDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Configuração correta do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAJpWnqlU_Xg2vOFSiCWdiHNRH3RgoxHzk",
    authDomain: "alunosepontuacao.firebaseapp.com",
    projectId: "alunosepontuacao",
    storageBucket: "alunosepontuacao.appspot.com",
    messagingSenderId: "763748397324",
    appId: "1:763748397324:web:2555df1f8a92c864a5d929"
};

// Inicializa Firebase e Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função para carregar os nomes dos alunos no <select>
async function carregarAlunos2() {
    const selectAluno = document.getElementById("nomeAluno");

    if (!selectAluno) {
        console.error("Elemento #nomeAluno não encontrado.");
        return;
    }

    try {
        const querySnapshot = await getDocs(collection(db, "turma7b")); // Obtém os documentos
        selectAluno.innerHTML = '<option value="">Selecionar aluno</option>'; // Reseta o select

        querySnapshot.forEach((doc) => {
            const aluno = doc.data().nome; // Supondo que o campo seja "nome"
            const option = document.createElement("option");
            option.value = aluno;
            option.textContent = aluno;
            selectAluno.appendChild(option);
        });

        console.log("Alunos carregados com sucesso.");
    } catch (error) {
        console.error("Erro ao buscar alunos:", error);
    }
}

// Chama a função ao carregar a página
document.addEventListener("DOMContentLoaded", carregarAlunos2);

document.addEventListener("DOMContentLoaded", function () {
    const pedras = document.querySelectorAll(".pedra");

    pedras.forEach(pedra => {
        pedra.addEventListener("mouseover", function () {
            this.src = this.src.replace(".png", "2.png"); // Adiciona "-hover"
        });

        pedra.addEventListener("mouseout", function () {
            this.src = this.src.replace("2.png", ".png"); // Remove "-hover"
        });
    });
});

// Função que retorna os troféus em formato de elemento HTML
function trofeu(pontos) {
    const container = document.createElement("div");
    container.classList.add("conquistas"); // Adiciona a classe CSS
    container.style.display = "flex"; // Para alinhar as imagens lado a lado
    container.style.gap = "5px"; // Para dar espaçamento entre elas

    // A cada 10 pontos, o aluno ganha um troféu (10 pontos = safira, 20 pontos = rubi, 30 pontos = esmeralda, 40 pontos = diamante)
    const imagens = [
        { src: "assets/safira.png", minPontos: 10 },
        { src: "assets/rubi.png", minPontos: 20 },
        { src: "assets/esmeralda.png", minPontos: 30 },
        { src: "assets/diamante.png", minPontos: 40 }
    ];

    imagens.forEach((img) => {
        if (pontos >= img.minPontos) {
            const imagem = document.createElement("img");
            imagem.src = img.src;
            imagem.style.maxWidth = "50px";
            container.appendChild(imagem);
        }
    });

    return container; // Retorna o elemento do container
}

// Função para atualizar a pontuação de um aluno
async function atualizarPontuacao(pontosAdicionais) {
    const nomeInput = document.getElementById("nomeAluno").value.trim();

    if (nomeInput === "" || isNaN(pontosAdicionais)) {
        alert("🚫 Por favor, selecione um nome e clique na pedra para atribuir pontos.");

        // Criar e tocar o som da moeda
        let somErro = new Audio("assets/erro.mp3");
        somErro.play();

        let erro = document.createElement("span"); // Usando <span> para o emoji
        erro.textContent = "👎"; // Emoji de polegar para baixo
        erro.style.position = "fixed";
        erro.style.bottom = "-50px"; // Começa fora da tela (embaixo)
        erro.style.left = "50%"; // Centraliza horizontalmente
        erro.style.transform = "translateX(-50%)"; // Ajusta para centralizar
        erro.style.fontSize = "100px";
        erro.style.zIndex = "1000"; // Garante que o emoji fique acima de outros elementos
        erro.style.transition = "bottom 1s ease-out"; // Animação de subida

        // Adicionando à tela
        document.body.appendChild(erro);

        // Subindo o emoji até o topo
        setTimeout(() => {
            erro.style.bottom = "100px"; // Faz o emoji subir até o topo
        }, 25);

        // Removendo o emoji após 1.5 segundos
        setTimeout(() => {
            erro.style.bottom = "-50px"; // Faz o emoji descer de volta para fora da tela
            setTimeout(() => erro.remove(), 1000); // Remove o emoji do DOM após o fade-out
        }, 1500);
        return;
    }

    try {
        // Obter a senha armazenada no Firestore
        const loginRef = collection(db, "login");
        const loginSnapshot = await getDocs(loginRef);

        if (loginSnapshot.empty) {
            alert("Erro: Nenhuma senha encontrada no sistema.");
            return;
        }

        let senhaCorreta;
        loginSnapshot.forEach((doc) => {
            senhaCorreta = doc.data().senha;
        });

        // Solicitar a senha ao usuário
        const senhaDigitada = prompt("Digite a senha para confirmar a atualização:");

        if (Number(senhaDigitada) !== senhaCorreta) {
            alert("❌ Senha incorreta! A pontuação não foi atualizada.");
            return;
        }

        // Se a senha estiver correta, continua a atualização da pontuação
        
        const alunosRef = collection(db, "turma7b");
        const q = query(alunosRef, where("nome", "==", nomeInput));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            alert("Aluno não encontrado!");
            return;
        }

        querySnapshot.forEach(async (documento) => {
            const alunoRef = doc(db, "turma7b", documento.id);
            const dadosAluno = documento.data();

            // Certificando-se de que a pontuação é tratada como números
            const pontosAtuais = Number(dadosAluno.pontos);
            const novaPontuacao = pontosAtuais + pontosAdicionais;

            await updateDoc(alunoRef, { pontos: novaPontuacao });

            alert(`Atualização: ${nomeInput} tem ${novaPontuacao} pontos💎!`);

            // Criar e tocar o som da moeda
            let somMoeda = new Audio("assets/moeda.mp3");
            somMoeda.play();
            
            // Criando o elemento de palma (emoji ou imagem)
            let palma = document.createElement("span"); // Ou use <img> se preferir uma imagem
            palma.textContent = "👏"; // Emoji de palma
            palma.style.position = "fixed";
            palma.style.bottom = "-50px"; // Começa fora da tela (embaixo)
            palma.style.left = "50%"; // Centralizado horizontalmente
            palma.style.transform = "translateX(-50%)"; // Ajusta para centralizar
            palma.style.fontSize = "100px";
            palma.style.zIndex = "1000"; // Para garantir que fique por cima de outros elementos
            palma.style.transition = "bottom 1s ease-out"; // A animação de subida

            // Adicionando à tela
            document.body.appendChild(palma);

            // A partir de agora, ela sobe para o topo
            setTimeout(() => {
                palma.style.bottom = "100px"; // Finaliza a animação no topo da tela
            }, 25);

            // Removendo a palma após 4 segundos
            setTimeout(() => {
                palma.style.bottom = "-50px"; // Move a palma de volta para baixo
                setTimeout(() => palma.remove(), 1000); // Remove do DOM após o fade-out
            }, 2000);

            carregarAlunos(); // Atualiza a tabela automaticamente
        });

    } catch (error) {
        console.error("Erro ao atualizar a pontuação:", error);
    }
}

// Função para definir os pontos ao clicar nas pedra turmalina
// document.getElementById("turmalina").onclick = () => atualizarPontuacao(10);
document.getElementById("turmalina").onclick = () => {
    atualizarPontuacao(1);
};

window.atualizarPontuacao = atualizarPontuacao;

// Função para carregar os alunos do Firestore
async function carregarAlunos() {
    const estudantesList = document.getElementById("estudantesList");
    if (!estudantesList) {
        console.error("Elemento #estudantesList não encontrado.");
        return;
    }
    estudantesList.innerHTML = ""; // Limpa a tabela
    try {
        const querySnapshot = await getDocs(collection(db, "turma7b"));
        querySnapshot.forEach((doc) => {
            const dados = doc.data();
            const linha = document.createElement("tr");

            // Criando células da tabela
            const tdNome = document.createElement("td");
            tdNome.textContent = dados.nome;
            
            // Adicionando efeito de hover
            tdNome.style.transition = "font-size 0.2s ease-in-out";

            tdNome.addEventListener("mouseover", function () {
                this.style.fontSize = "1.2em"; // Aumenta o tamanho
            });

            tdNome.addEventListener("mouseout", function () {
                this.style.fontSize = "1em"; // Retorna ao tamanho normal
            });

            const tdTrofeus = document.createElement("td");
            tdTrofeus.style.display = "flex";
            tdTrofeus.style.gap = "5px";
            tdTrofeus.style.alignItems = "center";

            // Obtendo os troféus corretamente como elementos
            const trofeusContainer = trofeu(dados.pontos);
            tdTrofeus.appendChild(trofeusContainer);

            linha.appendChild(tdNome);
            linha.appendChild(tdTrofeus);
            estudantesList.appendChild(linha);
        });
        console.log("Dados carregados com sucesso.");
    } catch (error) {
        console.error("Erro ao buscar dados do Firestore:", error);
    }
}

// Carrega os alunos quando a página for carregada
window.addEventListener('load', carregarAlunos);

// Rola a página suavemente ao passar o mouse nas bordas
document.addEventListener("mousemove", function (event) {
    const limiteInferior = window.innerHeight * 0.9; // 90% da tela → rola para baixo
    const limiteSuperior = window.innerHeight * 0.3; // 10% da tela → rola para cima

    if (event.clientY >= limiteInferior) {
        // Rola para baixo suavemente
        window.scrollBy({ top: 10, behavior: "smooth" });
    } else if (event.clientY <= limiteSuperior) {
        // Rola para cima suavemente
        window.scrollBy({ top: -10, behavior: "smooth" });
    }
});

