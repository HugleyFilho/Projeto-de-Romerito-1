document.addEventListener('DOMContentLoaded', () => {
    const flashes = document.querySelectorAll('.flash-message');
    flashes.forEach(msg => {
        setTimeout(() => {
            msg.style.transition = "opacity 0.5s ease";
            msg.style.opacity = "0";
            setTimeout(() => msg.remove(), 500);
        }, 5000);
    });

    const botoesComprar = document.querySelectorAll('.btn-principal');
    
    botoesComprar.forEach(botao => {
        if (botao.classList.contains('btn-banner')) return;

        botao.addEventListener('click', (e) => {
            const card = e.target.closest('.card-livro');
            const titulo = card.querySelector('h3').innerText;
            
            const textoOriginal = botao.innerText;
            botao.innerText = "Adicionado!";

            setTimeout(() => {
                botao.innerText = textoOriginal;
                botao.style.background = ""; 
            }, 2000);
        });
    });

    const cards = document.querySelectorAll('.card-livro');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = "translateY(-10px)";
            card.style.transition = "transform 0.3s ease";
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = "translateY(0)";
        });
    });

    document.querySelectorAll('.card-livro').forEach(card => {
        const botao = card.querySelector('.btn-principal');
        const precoTexto = card.querySelector('.preco');
        
        if (!precoTexto) return;
        
        const titulo = card.querySelector('h3').innerText;
        const preco = parseFloat(precoTexto.innerText.replace('R$', '').replace(',', '.').trim());

        botao.addEventListener('click', () => adicionarAoCarrinho(titulo, preco));
    });
});

let listaProdutos = [];
const menuCarrinho = document.getElementById('carrinho-lateral');
const fundoEscuro = document.getElementById('fundo-escuro');

function alternarCarrinho() {
    menuCarrinho.classList.toggle('carrinho-aberto');
    fundoEscuro.style.display = menuCarrinho.classList.contains('carrinho-aberto') ? 'block' : 'none';
}

function adicionarAoCarrinho(nome, preco) {
    listaProdutos.push({ nome, preco });
    atualizarInterface();
    
    if(!menuCarrinho.classList.contains('carrinho-aberto')) alternarCarrinho();
}

function atualizarInterface() {
    const conteinerItens = document.getElementById('itens-carrinho');
    const contador = document.getElementById('contador-carrinho');
    const elementoTotal = document.getElementById('preco-total');
    
    conteinerItens.innerHTML = '';
    let somaTotal = 0;

    listaProdutos.forEach((item, posicao) => {
        somaTotal += item.preco;
        conteinerItens.innerHTML += `
            <div class="item-no-carrinho">
                <div>
                    <div style="font-weight: bold;">${item.nome}</div>
                    <div style="color: #bbb;">R$ ${item.preco.toFixed(2)}</div>
                </div>
                <button class="botao-remover" onclick="removerItem(${posicao})">REMOVER</button>
            </div>
        `;
    });

    contador.innerText = listaProdutos.length;
    elementoTotal.innerText = `R$ ${somaTotal.toFixed(2)}`;

    if(listaProdutos.length === 0) {
        conteinerItens.innerHTML = '<p class="mensagem-vazia">Seu carrinho está vazio.</p>';
    }
}

function removerItem(posicao) {
    listaProdutos.splice(posicao, 1);
    atualizarInterface();
}

async function finalizarCompra() {
    if (listaProdutos.length === 0) {
        alert("Carrinho vazio!");
        return;
    }

    const resposta = await fetch('/finalizar_compra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ livros: listaProdutos }),
    });

    const resultado = await resposta.json();

    if (resposta.ok && resultado.status === 'sucesso') {
        listaProdutos = [];
        atualizarInterface();
        window.location.href = "/meus_livros";
    }
}
