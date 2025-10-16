document.addEventListener("DOMContentLoaded", function() {

  // --- Lógica para el panel lateral (Sidebar) ---
  const menuBtn = document.getElementById('menu-btn');
  const closeBtn = document.getElementById('close-btn');
  const sidebar = document.getElementById('sidebar-menu');
  const body = document.body;
  const overlay = document.querySelector('.overlay');

  function openSidebar() {
    sidebar.classList.add('open');
    body.classList.add('sidebar-active');
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    body.classList.remove('sidebar-active');
  }

  menuBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    openSidebar();
  });

  closeBtn.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);

  window.addEventListener('click', (event) => {
    if (sidebar.classList.contains('open') && !sidebar.contains(event.target) && event.target !== menuBtn) {
      closeSidebar();
    }
  });

  // --- Lógica para el Buscador Integrado ---
  const searchContainer = document.getElementById('search-container');
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('search-input');

  searchBtn.addEventListener('click', () => {
    const isExpanded = searchContainer.classList.contains('active');
    
    if (isExpanded && searchInput.value !== '') {
      alert(`Buscando: ${searchInput.value}`);
      // window.location.href = `/buscar?q=${searchInput.value}`;
    } else {
      searchContainer.classList.toggle('active');
      if (searchContainer.classList.contains('active')) {
        searchInput.focus();
      }
    }
  });
  
  // --- Funciones del Carrito ---
  function obtenerCarrito() {
    const carrito = localStorage.getItem('recirculate_carrito');
    return carrito ? JSON.parse(carrito) : [];
  }

  function guardarCarrito(carrito) {
    localStorage.setItem('recirculate_carrito', JSON.stringify(carrito));
  }

  function actualizarContadorCarrito() {
    const carrito = obtenerCarrito();
    const cartCounter = document.getElementById('cart-counter');
    const totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
    cartCounter.textContent = totalItems;
  }

  function mostrarNotificacion(mensaje) {
    const notificacion = document.createElement('div');
    notificacion.innerHTML = `<i class="fas fa-check-circle"></i><span>${mensaje}</span>`;
    
    notificacion.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: #27ae60;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: "Poppins", sans-serif;
    `;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
      notificacion.style.opacity = '0';
      notificacion.style.transform = 'translateX(400px)';
      notificacion.style.transition = 'all 0.3s ease-out';
      setTimeout(() => notificacion.remove(), 300);
    }, 3000);
  }

  function agregarAlCarrito(producto) {
    let carrito = obtenerCarrito();
    const existe = carrito.find(item => item.id === producto.id);
    
    if (existe) {
      existe.cantidad = (existe.cantidad || 1) + 1;
    } else {
      carrito.push({
        ...producto,
        cantidad: 1
      });
    }
    
    guardarCarrito(carrito);
    actualizarContadorCarrito();
    mostrarNotificacion('✓ Producto agregado al carrito');
  }

  // Actualizar contador al cargar la página
  actualizarContadorCarrito();

  // --- Lógica para los botones "Añadir al carrito" ---
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

  addToCartButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      const card = button.closest('.product-card');
      const imagen = card.querySelector('.main-image').src;
      const nombre = card.querySelector('h3').textContent;
      const precioTexto = card.querySelector('.precio').textContent;
      // Eliminar símbolos y texto, luego quitar puntos (separadores de miles)
      const precio = parseFloat(precioTexto.replace(/[^0-9.]/g, '').replace(/\./g, ''));
      
      const producto = {
        id: `remera-${index + 1}`,
        nombre: nombre,
        precio: precio,
        imagen: imagen
      };
      
      agregarAlCarrito(producto);
    });
  });

  // --- Lógica para el Ordenamiento/Filtrado ---
  const ordenarSelect = document.getElementById('ordenar');
  const filterBtn = document.querySelector('.filter-btn');
  const productGrid = document.querySelector('.category-grid');
  
  // Guardar el orden original al cargar la página
  const ordenOriginal = Array.from(productGrid.querySelectorAll('.product-card'));

  function ordenarProductos() {
    const orderValue = ordenarSelect.value;
    let productCards = Array.from(productGrid.querySelectorAll('.product-card'));
    
    if (orderValue === 'destacados') {
      // Restaurar el orden original
      productCards = [...ordenOriginal];
    } else {
      productCards.sort((a, b) => {
        switch(orderValue) {
          case 'precio-asc':
            const precioA = parseFloat(a.querySelector('.precio').textContent.replace(/[^0-9.]/g, '').replace(/\./g, ''));
            const precioB = parseFloat(b.querySelector('.precio').textContent.replace(/[^0-9.]/g, '').replace(/\./g, ''));
            return precioA - precioB;
          
          case 'precio-desc':
            const precioDescA = parseFloat(a.querySelector('.precio').textContent.replace(/[^0-9.]/g, '').replace(/\./g, ''));
            const precioDescB = parseFloat(b.querySelector('.precio').textContent.replace(/[^0-9.]/g, '').replace(/\./g, ''));
            return precioDescB - precioDescA;
          
          case 'nombre-asc':
            const nombreA = a.querySelector('h3').textContent.toLowerCase();
            const nombreB = b.querySelector('h3').textContent.toLowerCase();
            return nombreA.localeCompare(nombreB);
          
          case 'nuevos':
            // Invertir el orden (los últimos productos primero)
            return -1;
          
          default:
            return 0;
        }
      });
    }

    // Limpiar el grid y volver a agregar en el nuevo orden
    productGrid.innerHTML = '';
    productCards.forEach(card => productGrid.appendChild(card));
  }

  // Event listeners para ordenamiento
  if (filterBtn) {
    filterBtn.addEventListener('click', ordenarProductos);
  }
  
  if (ordenarSelect) {
    ordenarSelect.addEventListener('change', ordenarProductos);
  }

});
