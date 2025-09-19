document.addEventListener('DOMContentLoaded', () => {
    // --- DATABASE MOCK ---
    const MOCK_DATA = {
        cardapio: [
            { id: 1, nome: "Salada de Frutas", preco: 6.00, img: "https://i.imgur.com/T0n2q5d.jpeg" },
            { id: 2, nome: "Suco de Jambo", preco: 3.00, img: "https://i.imgur.com/kFLk5Yk.jpeg" },
            { id: 3, nome: "Brownie Zero Açúcar", preco: 5.50, img: "https://i.imgur.com/5DE2i3L.jpeg" },
            { id: 4, nome: "Cookies Fitness", preco: 4.00, img: "https://i.imgur.com/mJ5T4pZ.jpeg" },
            { id: 5, nome: "Sanduíche Natural", preco: 8.00, img: "https://i.imgur.com/1G6UjGd.jpeg" },
            { id: 6, nome: "Suco Detox", preco: 7.00, img: "https://i.imgur.com/eBwFmOC.jpeg" },
        ],
        pedidos: JSON.parse(localStorage.getItem('pedidos')) || []
    };
   
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // --- SCREEN NAVIGATION ---
    const screens = document.querySelectorAll('.screen');
    const navigateTo = (screenId) => {
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    };

    // Role selection buttons
    document.getElementById('aluno-btn').addEventListener('click', () => navigateTo('aluno-login-screen'));
    document.getElementById('adm-btn').addEventListener('click', () => navigateTo('adm-login-screen'));

    // Login buttons
    document.querySelectorAll('.login-submit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const parentScreen = e.target.closest('.screen').id;
            if (parentScreen === 'aluno-login-screen') {
                renderCardapio();
                navigateTo('cardapio-screen');
            } else if (parentScreen === 'adm-login-screen') {
                renderAdminDashboard();
                navigateTo('adm-dashboard-screen');
            }
        });
    });
   
    // Other navigation
    document.getElementById('cart-btn').addEventListener('click', () => {
        renderCart();
        navigateTo('cart-screen');
    });
    document.getElementById('back-to-cardapio').addEventListener('click', () => navigateTo('cardapio-screen'));
   
    // --- CARDÁPIO LOGIC ---
    const cardapioList = document.getElementById('cardapio-list');
   
    const renderCardapio = (filter = '') => {
        cardapioList.innerHTML = '';
        const filteredItems = MOCK_DATA.cardapio.filter(item =>
            item.nome.toLowerCase().includes(filter.toLowerCase())
        );

        filteredItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cardapio-item';
            itemDiv.innerHTML = `
                <img src="${item.img}" alt="${item.nome}">
                <h4>${item.nome}</h4>
                <p class="price">R$${item.preco.toFixed(2)}</p>
                <button class="add-to-cart-btn" data-id="${item.id}">Adicionar</button>
            `;
            cardapioList.appendChild(itemDiv);
        });
    };
   
    document.getElementById('search-input').addEventListener('input', (e) => {
        renderCardapio(e.target.value);
    });

    cardapioList.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const itemId = parseInt(e.target.dataset.id);
            addToCart(itemId);
        }
    });

    // --- CART LOGIC ---
    const updateCart = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
        document.getElementById('cart-count').textContent = cart.reduce((acc, item) => acc + item.quantity, 0);
    };

    const addToCart = (itemId) => {
        const itemInCart = cart.find(item => item.id === itemId);
        if (itemInCart) {
            itemInCart.quantity++;
        } else {
            cart.push({ id: itemId, quantity: 1 });
        }
        updateCart();
    };
   
    const renderCart = () => {
        const cartContainer = document.getElementById('cart-items-container');
        cartContainer.innerHTML = '';
        let totalPrice = 0;

        if (cart.length === 0) {
            cartContainer.innerHTML = '<p style="text-align:center; padding: 20px;">Seu carrinho está vazio.</p>';
            document.getElementById('cart-total-price').textContent = 'R$0,00';
            return;
        }

        const header = document.createElement('div');
        header.className = 'cart-item';
        header.innerHTML = '<strong>produto</strong><strong>unit.</strong><strong>qtd.</strong><strong>preço</strong>';
        cartContainer.appendChild(header);

        cart.forEach(cartItem => {
            const product = MOCK_DATA.cardapio.find(p => p.id === cartItem.id);
            const itemTotalPrice = product.preco * cartItem.quantity;
            totalPrice += itemTotalPrice;

            const cartItemDiv = document.createElement('div');
            cartItemDiv.className = 'cart-item';
            cartItemDiv.innerHTML = `
                <span>${product.nome}</span>
                <span>R$${product.preco.toFixed(2)}</span>
                <span>${cartItem.quantity}</span>
                <span>R$${itemTotalPrice.toFixed(2)}</span>
            `;
            cartContainer.appendChild(cartItemDiv);
        });
       
        document.getElementById('cart-total-price').textContent = `R$${totalPrice.toFixed(2)}`;
    };

    document.getElementById('clear-cart-btn').addEventListener('click', () => {
        cart = [];
        updateCart();
        renderCart();
    });

    document.getElementById('checkout-btn').addEventListener('click', () => {
        if (cart.length === 0) {
            alert("Seu carrinho está vazio!");
            return;
        }
        const newOrder = {
            id: Date.now(),
            items: [...cart],
            status: 'pendente' // pendente, preparacao, entregue
        };
        MOCK_DATA.pedidos.push(newOrder);
        localStorage.setItem('pedidos', JSON.stringify(MOCK_DATA.pedidos));
       
        cart = [];
        updateCart();
       
        alert("Pedido realizado com sucesso!");
        navigateTo('cardapio-screen');
    });

    // --- ADMIN DASHBOARD LOGIC ---
    const renderAdminDashboard = () => {
        const pedidosDiaList = document.querySelector('#pedidos-do-dia .order-list');
        const emPreparacaoList = document.querySelector('#em-preparacao .order-list');
        const entregueList = document.querySelector('#entregue .order-list');
       
        pedidosDiaList.innerHTML = '';
        emPreparacaoList.innerHTML = '';
        entregueList.innerHTML = '';

        MOCK_DATA.pedidos.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';
           
            let itemsHtml = order.items.map(item => {
                const product = MOCK_DATA.cardapio.find(p => p.id === item.id);
                return `<li>${product.nome} ${item.quantity}x</li>`;
            }).join('');

            orderCard.innerHTML = `
                <ul>${itemsHtml}</ul>
                <div class="order-card-actions">
                    ${order.status === 'pendente' ? `<button class="btn-prepare" data-id="${order.id}">Preparar</button>` : ''}
                    ${order.status === 'preparacao' ? `<button class="btn-deliver" data-id="${order.id}">Entregar</button>` : ''}
                </div>
            `;
           
            if (order.status === 'pendente') {
                pedidosDiaList.appendChild(orderCard);
            } else if (order.status === 'preparacao') {
                emPreparacaoList.appendChild(orderCard);
            } else if (order.status === 'entregue') {
                entregueList.appendChild(orderCard);
            }
        });
    };
   
    document.getElementById('adm-dashboard-screen').addEventListener('click', (e) => {
        const orderId = e.target.dataset.id;
        if (!orderId) return;

        const order = MOCK_DATA.pedidos.find(o => o.id == orderId);

        if (e.target.classList.contains('btn-prepare')) {
            order.status = 'preparacao';
        } else if (e.target.classList.contains('btn-deliver')) {
            order.status = 'entregue';
        }
       
        localStorage.setItem('pedidos', JSON.stringify(MOCK_DATA.pedidos));
        renderAdminDashboard();
    });

    // --- INITIALIZATION ---
    navigateTo('role-selection-screen');
    updateCart();
});
