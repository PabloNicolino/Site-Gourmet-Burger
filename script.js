/* Referencias para manipular*/

const menu = document.getElementById("menu")
const cartBtn = document.getElementById("cart-btn")
const cartModal = document.getElementById("cart-modal")
const cartItemsContainer = document.getElementById("cart-items")
const cartTotal = document.getElementById("cart-total")
const checkoutBtn = document.getElementById("checkout-btn")
const closeModalBtn = document.getElementById("close-modal-btn")
const cartCounter = document.getElementById("cart-count")
const addressInput = document.getElementById("address")
const addressWarn = document.getElementById("address-warn")

let cart = []; // Inicializa um array vazio que representa o carrinho de compras

// Abrir o modal do carrinho
cartBtn.addEventListener("click", function() {
  updateCartModal(); // Atualiza o conteúdo do modal do carrinho antes de abrir
  cartModal.style.display = "flex"; // Exibe o modal do carrinho
});

// Fechar modal quando clicar fora
cartModal.addEventListener("click", function(event) {
  if(event.target === cartModal) { // Verifica se o clique foi fora do conteúdo do modal (no fundo)
    cartModal.style.display = "none"; // Fecha o modal do carrinho
  }
});

// Clicar no botão FECHAR o modal vai fechar.
closeModalBtn.addEventListener("click", function() {
  cartModal.style.display = "none"; // Fecha o modal do carrinho ao clicar no botão de fechar
});

menu.addEventListener("click", function(event) {
  let parentButton = event.target.closest(".add-to-cart-btn"); // Encontra o botão "Adicionar ao carrinho" mais próximo do elemento clicado

  if(parentButton) {
    const name = parentButton.getAttribute("data-name"); // Obtém o nome do item a partir do atributo data-name do botão
    const price = parseFloat(parentButton.getAttribute("data-price")); // Obtém o preço do item a partir do atributo data-price do botão e converte para número
    
    // Adiciona o item no carrinho
    addTocart(name, price);
  }
});


// Função para adicionar no carrinho
function addTocart(name, price){
  const existingItem = cart.find(item => item.name === name);

  if(existingItem) {
    // Se o item já existe, aumenta apenas a quantidade +1
    existingItem.quantity += 1;
  } else {
    // Se o item não existe, adiciona ao carrinho com quantidade 1
    cart.push({
      name,
      price,
      quantity: 1,
    });
  }

  updateCartModal(); // Atualiza o modal do carrinho após a adição
}

// Atualizar o carrinho
function updateCartModal() {
  cartItemsContainer.innerHTML = ""; // Limpa o conteúdo atual do modal do carrinho
  let total = 0; // Inicializa o total

  cart.forEach(item => {
    const cartItemElement = document.createElement("div");
    cartItemElement.classList.add("flex", "justify-between", "mb-4", "flex-col");

    cartItemElement.innerHTML = 
    ` 
      <div class="flex items-center justify-between"> 
        <div> 
          <p class="font-medium">${item.name}</p>
          <p>Qtd: ${item.quantity}</p>
          <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
        </div>
        <button class="remove-btn" data-name="${item.name}">
          Remover
        </button>
      </div>
    `;

    total += item.price * item.quantity; // Atualiza o total do carrinho

    cartItemsContainer.appendChild(cartItemElement); // Adiciona o item ao container do modal
  });

  // Atualiza o total e a contagem do carrinho
  cartTotal.textContent = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  cartCounter.innerHTML = cart.length;
}

// Função para remover o item do carrinho
cartItemsContainer.addEventListener("click", function(event) {
  if(event.target.classList.contains("remove-btn")) {
    const name = event.target.getAttribute("data-name");

    removeItemCart(name); // Chama a função para remover o item do carrinho
  }
});

function removeItemCart(name) {
  const index = cart.findIndex(item => item.name === name);

  if(index !== -1) {
    const item = cart[index];

    if(item.quantity > 1) {
      // Se a quantidade for maior que 1, apenas diminui a quantidade
      item.quantity -= 1;
      updateCartModal(); // Atualiza o modal do carrinho
      return;
    }

    // Se a quantidade for 1, remove o item do carrinho
    cart.splice(index, 1);
    updateCartModal(); // Atualiza o modal do carrinho
  }
}

// Validação do endereço de entrega
addressInput.addEventListener("input", function(event) {
  let inputValue = event.target.value;

  if(inputValue !== "") {
    // Remove o aviso e a borda vermelha se o endereço for válido
    addressInput.classList.remove("border-red-500");
    addressWarn.classList.add("hidden");
  }
});


// Finalizar pedido ao clicar no botão de checkout
checkoutBtn.addEventListener("click", function() {
  // Verifica se a loja está aberta
  const isOpen = checkOpen();
  if (!isOpen) {
    // Se a loja estiver fechada, exibe um aviso e retorna sem finalizar o pedido
    Toastify({
      text: "Loja está fechada no momento!",
      duration: 3000,
      close: true,
      gravity: "top", 
      position: "right", 
      stopOnFocus: true, 
      style: {
        background: "#EF4444",
      },
    }).showToast();
    return;
  }
  
  // Verifica se o carrinho está vazio
  if (cart.length === 0) {
    return; // Se o carrinho estiver vazio, retorna sem finalizar o pedido
  }

  // Verifica se o campo de endereço está vazio
  if (addressInput.value === "") {
    // Se o campo de endereço estiver vazio, exibe um aviso visual
    addressWarn.classList.remove("hidden");
    addressInput.classList.add("border-red-500");
    return; // Retorna sem finalizar o pedido
  }

  // Monta a mensagem do pedido para enviar via WhatsApp
  const cartItems = cart.map((item) => {
    return `${item.name} Quantidade: (${item.quantity}) Preço: R$${item.price.toFixed(2)} |`;
  }).join("");

  const message = encodeURIComponent(cartItems); // Codifica a mensagem para URL
  const phone = ""; // Número de telefone para enviar o pedido

  // Abre uma nova janela com o link do WhatsApp para enviar a mensagem
  window.open(`https://wa.me/${phone}?text=${message} Endereço: ${addressInput.value}`, "_blank");

  // Zera o carrinho após finalizar o pedido
  cart = [];
  updateCartModal(); // Atualiza o modal do carrinho para refletir a remoção dos itens
});

// Verificar se a loja está aberta com base no horário atual
function checkOpen() {
  const data = new Date(); // Obtém a data atual
  const hora = data.getHours(); // Obtém a hora atual

  // Verifica se a hora está entre 17h e 22h (loja aberta)
  return hora >= 18 && hora < 22;
}

// Atualiza a classe do elemento visual indicando se a loja está aberta ou fechada
const spanItem = document.getElementById("date-span"); // Obtém o elemento span pelo ID
const isOpen = checkOpen(); // Verifica se a loja está aberta no momento

if (isOpen) {
  // Se a loja estiver aberta, define a classe para indicar "aberto"
  spanItem.classList.remove("bg-red-500");
  spanItem.classList.add("bg-green-600");
} else {
  // Se a loja estiver fechada, define a classe para indicar "fechado"
  spanItem.classList.remove("bg-green-600");
  spanItem.classList.add("bg-red-500");
}
