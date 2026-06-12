/* =============================================
   MORADA DO AÇAÍ - JavaScript
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  // Page Loader
  const pageLoader = document.getElementById('pageLoader');
  setTimeout(() => {
    pageLoader.classList.add('hidden');
  }, 1800);

  // Header scroll effect
  const header = document.getElementById('header');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });

  // Mobile menu toggle
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close mobile menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinksAll = navLinks.querySelectorAll('a');

  function updateActiveNav() {
    const scrollPos = window.pageYOffset + 150;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinksAll.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav);

  // Scroll reveal animations
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // Counter animation for stats
  const statNumbers = document.querySelectorAll('.about-stat .number');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'));
        animateCounter(el, target);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => counterObserver.observe(el));

  function animateCounter(element, target) {
    const duration = 2000;
    const startTime = performance.now();
    const startValue = 0;

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (target - startValue) * easeOut);

      if (target >= 1000) {
        element.textContent = current.toLocaleString('pt-BR') + '+';
      } else {
        element.textContent = current;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // Back to top button
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const headerHeight = header.offsetHeight;
        const targetPosition = target.offsetTop - headerHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Parallax-like effect on hero
  const hero = document.querySelector('.hero-bg img');
  if (hero) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      if (scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.3}px) scale(1.1)`;
      }
    });
  }

  // =============================================
  // SHOPPING CART & CUSTOMIZER MODAL STATE
  // =============================================

  let cart = [];
  try {
    const savedCart = localStorage.getItem('morada_do_acai_cart');
    cart = savedCart ? JSON.parse(savedCart) : [];
  } catch (e) {
    console.error("Erro ao ler carrinho do localStorage", e);
  }

  // Currency Formatter
  function formatCurrency(val) {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // DOM Elements
  const cartFloatBtn = document.getElementById('cartFloatBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const closeDrawer = document.getElementById('closeDrawer');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const btnCheckoutNext = document.getElementById('btnCheckoutNext');
  const btnCheckoutBack = document.getElementById('btnCheckoutBack');
  const cartView = document.getElementById('cartView');
  const checkoutView = document.getElementById('checkoutView');
  const checkoutForm = document.getElementById('checkoutForm');
  
  // Checkout Form Fields
  const clientName = document.getElementById('clientName');
  const clientPhone = document.getElementById('clientPhone');
  const paymentMethod = document.getElementById('paymentMethod');
  const changeGroup = document.getElementById('changeGroup');
  const cashChange = document.getElementById('cashChange');
  const addressFields = document.getElementById('addressFields');
  const streetInput = document.getElementById('street');
  const neighborhoodInput = document.getElementById('neighborhood');
  
  // Açaí Customization Modal Elements
  const acaiModal = document.getElementById('acaiModal');
  const closeAcaiModal = document.getElementById('closeAcaiModal');
  const acaiForm = document.getElementById('acaiForm');
  const modalTotalPrice = document.getElementById('modalTotalPrice');

  // Create Cart Overlay dynamically if it doesn't exist
  let overlay = document.querySelector('.cart-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'cart-overlay';
    document.body.appendChild(overlay);
  }

  // Control Cart Drawer Visibility
  function openCart() {
    if (cartDrawer) cartDrawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    if (cartDrawer) cartDrawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
    showCartView();
  }

  if (cartFloatBtn) cartFloatBtn.addEventListener('click', openCart);
  if (closeDrawer) closeDrawer.addEventListener('click', closeCart);
  if (overlay) overlay.addEventListener('click', closeCart);

  // Switch Drawer Views
  function showCheckoutView() {
    if (cart.length === 0) return;
    if (cartView) cartView.classList.add('hidden');
    if (checkoutView) checkoutView.classList.remove('hidden');
  }

  function showCartView() {
    if (cartView) cartView.classList.remove('hidden');
    if (checkoutView) checkoutView.classList.add('hidden');
  }

  if (btnCheckoutNext) btnCheckoutNext.addEventListener('click', showCheckoutView);
  if (btnCheckoutBack) btnCheckoutBack.addEventListener('click', showCartView);

  // Delivery type radio handlers
  const deliveryTypeRadios = document.querySelectorAll('input[name="deliveryType"]');
  deliveryTypeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      // Toggle active class on label wrappers
      document.querySelectorAll('.delivery-type-label').forEach(lbl => lbl.classList.remove('active'));
      radio.closest('.delivery-type-label').classList.add('active');

      if (radio.value === 'delivery') {
        if (addressFields) addressFields.style.display = 'block';
        if (streetInput) streetInput.setAttribute('required', 'true');
        if (neighborhoodInput) neighborhoodInput.setAttribute('required', 'true');
      } else {
        if (addressFields) addressFields.style.display = 'none';
        if (streetInput) streetInput.removeAttribute('required');
        if (neighborhoodInput) neighborhoodInput.removeAttribute('required');
      }
    });
  });

  // Payment method handler (show/hide cash change field)
  if (paymentMethod) {
    paymentMethod.addEventListener('change', () => {
      if (paymentMethod.value === 'dinheiro') {
        if (changeGroup) changeGroup.classList.remove('hidden');
        if (cashChange) cashChange.setAttribute('required', 'true');
      } else {
        if (changeGroup) changeGroup.classList.add('hidden');
        if (cashChange) {
          cashChange.removeAttribute('required');
          cashChange.value = '';
        }
      }
    });
  }

  // Format phone input
  if (clientPhone) {
    clientPhone.addEventListener('input', function(e) {
      let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
      e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    });
  }

  // Save cart state
  function saveCart() {
    localStorage.setItem('morada_do_acai_cart', JSON.stringify(cart));
    updateCartUI();
  }

  // Cross-tab real-time sync
  window.addEventListener('storage', (e) => {
    if (e.key === 'morada_do_acai_cart') {
      try {
        cart = e.newValue ? JSON.parse(e.newValue) : [];
        updateCartUI();
      } catch (err) {
        console.error("Erro ao sincronizar carrinho", err);
      }
    }
  });

  // Update Cart Drawer UI
  function updateCartUI() {
    let totalItems = 0;
    let subtotal = 0;
    cart.forEach(item => {
      totalItems += item.quantity;
      subtotal += item.price * item.quantity;
    });

    const cartBadge = document.getElementById('cartBadge');
    if (cartBadge) {
      cartBadge.textContent = totalItems;
      cartBadge.style.animation = 'none';
      void cartBadge.offsetWidth; // trigger reflow
      cartBadge.style.animation = 'popIn 0.3s ease-out';
    }

    if (cartItemsList) {
      if (cart.length === 0) {
        cartItemsList.innerHTML = `
          <div class="empty-cart-message">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <p>Seu carrinho está vazio.</p>
          </div>
        `;
        if (btnCheckoutNext) btnCheckoutNext.disabled = true;
      } else {
        let itemsHTML = '';
        cart.forEach(item => {
          itemsHTML += `
            <div class="cart-item">
              <div class="cart-item-img">
                <img src="${item.image}" alt="${item.name}">
              </div>
              <div class="cart-item-details">
                <span class="cart-item-name">${item.name}</span>
                ${item.optionsText ? `<div class="cart-item-options"><p>${item.optionsText}</p></div>` : ''}
                <div class="cart-item-meta">
                  <span class="cart-item-price">${formatCurrency(item.price * item.quantity)}</span>
                  <div class="cart-item-actions">
                    <button class="qty-btn minus" onclick="updateQty('${item.id}', -1)">-</button>
                    <span class="cart-item-qty">${item.quantity}</span>
                    <button class="qty-btn plus" onclick="updateQty('${item.id}', 1)">+</button>
                    <button class="btn-remove-item" onclick="removeCartItem('${item.id}')" aria-label="Remover item">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `;
        });
        cartItemsList.innerHTML = itemsHTML;
        if (btnCheckoutNext) btnCheckoutNext.disabled = false;
      }
    }

    if (cartSubtotal) {
      cartSubtotal.textContent = formatCurrency(subtotal);
    }
  }

  // Global window functions for inline onclick handlers
  window.updateQty = function(id, delta) {
    const index = cart.findIndex(item => item.id === id);
    if (index > -1) {
      cart[index].quantity += delta;
      if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
      }
      saveCart();
    }
  };

  window.removeCartItem = function(id) {
    const index = cart.findIndex(item => item.id === id);
    if (index > -1) {
      cart.splice(index, 1);
      saveCart();
    }
  };

  // Add standard catalog items to cart
  function addRegularItem(name, price, image) {
    const existingIndex = cart.findIndex(item => item.name === name && !item.isCustom);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        id: 'regular-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        name: name,
        price: price,
        image: image || 'images/logo-morada.png',
        quantity: 1,
        isCustom: false
      });
    }
    saveCart();
    openCart();
  }

  // =============================================
  // DEDICATED CUSTOMIZER PAGE (AÇAÍ) LOGIC
  // =============================================

  const isMontarPage = window.location.pathname.includes('montar.html');

  function enforceOptionLimits() {
    const optionGrids = document.querySelectorAll('.option-tiles');
    optionGrids.forEach(grid => {
      const limit = parseInt(grid.getAttribute('data-limit')) || 3;
      const checkboxes = grid.querySelectorAll('input[type="checkbox"]');
      const checkedCount = grid.querySelectorAll('input[type="checkbox"]:checked').length;
      
      checkboxes.forEach(cb => {
        const label = cb.closest('.tile-option');
        if (cb.checked) {
          cb.disabled = false;
          if (label) label.classList.remove('disabled');
        } else {
          cb.disabled = checkedCount >= limit;
          if (label) {
            if (checkedCount >= limit) {
              label.classList.add('disabled');
            } else {
              label.classList.remove('disabled');
            }
          }
        }
      });
    });
  }

  if (isMontarPage && acaiForm) {
    const realPhotoPreview = document.getElementById('realPhotoPreview');
    const previewSizeBadge = document.getElementById('previewSizeBadge');

    const summarySize = document.getElementById('summarySize');
    const summaryCremes = document.getElementById('summaryCremes');
    const summaryFrutas = document.getElementById('summaryFrutas');
    const summaryToppings = document.getElementById('summaryToppings');
    const montarTotalPrice = document.getElementById('montarTotalPrice');

    // Parse URL size parameter
    const urlParams = new URLSearchParams(window.location.search);
    const sizeParam = urlParams.get('size');
    if (sizeParam) {
      const targetRadio = acaiForm.querySelector(`input[name="acaiSize"][value="${sizeParam}"]`);
      if (targetRadio) {
        targetRadio.checked = true;
      }
    }

    function updatePreviewAndSummary() {
      // 1. Size
      const selectedSizeRadio = acaiForm.querySelector('input[name="acaiSize"]:checked');
      const size = selectedSizeRadio ? selectedSizeRadio.value : '300ml';
      const basePrice = selectedSizeRadio ? parseFloat(selectedSizeRadio.getAttribute('data-price')) : 15.90;

      // Update Size Badge
      if (previewSizeBadge) {
        previewSizeBadge.textContent = `Copo ${size}`;
      }

      // Update Preview scale dynamically to simulate volume
      if (realPhotoPreview) {
        if (size === '300ml') {
          realPhotoPreview.style.transform = 'scale(0.92)';
        } else if (size === '500ml') {
          realPhotoPreview.style.transform = 'scale(1.0)';
        } else if (size === '700ml') {
          realPhotoPreview.style.transform = 'scale(1.08)';
        }
      }

      if (summarySize) {
        summarySize.textContent = `Copo ${size}`;
      }

      // 2. Cremes
      const selectedCremes = Array.from(acaiForm.querySelectorAll('input[name="acaiCremes"]:checked')).map(cb => cb.value);
      if (summaryCremes) {
        summaryCremes.textContent = selectedCremes.length > 0 ? selectedCremes.join(', ') : 'Nenhum selecionado';
      }

      // 3. Frutas
      const selectedFrutas = Array.from(acaiForm.querySelectorAll('input[name="acaiFrutas"]:checked')).map(cb => cb.value);
      if (summaryFrutas) {
        summaryFrutas.textContent = selectedFrutas.length > 0 ? selectedFrutas.join(', ') : 'Nenhuma selecionada';
      }

      // 4. Toppings
      const selectedToppings = Array.from(acaiForm.querySelectorAll('input[name="acaiToppings"]:checked')).map(cb => cb.value);
      if (summaryToppings) {
        summaryToppings.textContent = selectedToppings.length > 0 ? selectedToppings.join(', ') : 'Nenhum selecionado';
      }

      // 5. Total Price
      if (montarTotalPrice) {
        montarTotalPrice.textContent = formatCurrency(basePrice);
      }
    }

    // Attach listeners
    acaiForm.querySelectorAll('input[name="acaiSize"]').forEach(radio => {
      radio.addEventListener('change', () => {
        updatePreviewAndSummary();
      });
    });

    acaiForm.querySelectorAll('.option-tiles input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        enforceOptionLimits();
        updatePreviewAndSummary();
      });
    });

    // Run once on load
    enforceOptionLimits();
    updatePreviewAndSummary();

    // Handle Page Customizer Add to Cart submit
    acaiForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const selectedSizeRadio = acaiForm.querySelector('input[name="acaiSize"]:checked');
      if (!selectedSizeRadio) return;
      
      const size = selectedSizeRadio.value;
      const price = parseFloat(selectedSizeRadio.getAttribute('data-price')) || 0;
      
      const cremes = Array.from(acaiForm.querySelectorAll('input[name="acaiCremes"]:checked')).map(cb => cb.value);
      const frutas = Array.from(acaiForm.querySelectorAll('input[name="acaiFrutas"]:checked')).map(cb => cb.value);
      const toppings = Array.from(acaiForm.querySelectorAll('input[name="acaiToppings"]:checked')).map(cb => cb.value);
      
      const optionsList = [];
      if (cremes.length > 0) optionsList.push(`Cremes: ${cremes.join(', ')}`);
      if (frutas.length > 0) optionsList.push(`Frutas: ${frutas.join(', ')}`);
      if (toppings.length > 0) optionsList.push(`Adicionais: ${toppings.join(', ')}`);
      const optionsText = optionsList.join(' | ');
      
      const item = {
        id: 'acai-custom-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        name: `Monte seu Açaí (${size})`,
        price: price,
        image: 'images/acai-real.jpg?v=3',
        quantity: 1,
        isCustom: true,
        details: {
          size: size,
          cremes: cremes,
          frutas: frutas,
          toppings: toppings
        },
        optionsText: optionsText
      };
      
      cart.push(item);
      saveCart();
      
      // Page feedback: open cart drawer immediately
      openCart();
    });
  }

  // =============================================
  // REDIRECT / ADD TO CART BUTTON CLICK EVENTS
  // =============================================

  document.querySelectorAll('.btn-add').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      
      const isCardapio = window.location.pathname.includes('cardapio.html');
      
      if (isCardapio) {
        const card = this.closest('.menu-catalog-card');
        if (!card) return;
        
        const category = card.getAttribute('data-category');
        const name = card.querySelector('h3').textContent.trim();
        
        if (category === 'acai') {
          let size = '300ml';
          if (name.includes('300ml')) size = '300ml';
          else if (name.includes('500ml')) size = '500ml';
          else if (name.includes('700ml')) size = '700ml';
          
          window.location.href = `montar.html?size=${size}`;
        } else {
          const priceText = card.querySelector('.menu-catalog-price').textContent.trim();
          const price = parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.'));
          const img = card.querySelector('img');
          const image = img ? img.getAttribute('src') : 'images/logo-morada.png';
          
          addRegularItem(name, price, image);
          
          // Button Visual Feedback
          const originalText = this.textContent;
          this.textContent = '✓ Adicionado!';
          this.style.background = '#25d366';
          this.style.color = '#ffffff';
          this.style.borderColor = '#25d366';
          setTimeout(() => {
            this.textContent = originalText;
            this.style.background = '';
            this.style.color = '';
            this.style.borderColor = '';
          }, 1200);
        }
      } else {
        const card = this.closest('.specialty-card');
        if (!card) return;
        
        const title = card.querySelector('h3').textContent.trim();
        if (title.includes('Açaí') || title.includes('acai')) {
          window.location.href = 'montar.html?size=300ml';
        } else if (title.includes('Tapioca')) {
          window.location.href = 'cardapio.html?filter=tapiocas';
        } else if (title.includes('Crepe')) {
          window.location.href = 'cardapio.html?filter=crepes';
        } else if (title.includes('Suco')) {
          window.location.href = 'cardapio.html?filter=sucos';
        }
      }
    });
  });


  // =============================================
  // SUBMIT CHECKOUT FORM TO WHATSAPP
  // =============================================

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (cart.length === 0) return;
      
      const name = clientName.value.trim();
      const phone = clientPhone.value.trim();
      const deliveryType = checkoutForm.querySelector('input[name="deliveryType"]:checked').value;
      const payment = paymentMethod.value;
      const change = cashChange ? cashChange.value.trim() : '';
      
      let street = '';
      let neighborhood = '';
      let complement = '';
      
      if (deliveryType === 'delivery') {
        if (streetInput) street = streetInput.value.trim();
        if (neighborhoodInput) neighborhood = neighborhoodInput.value.trim();
        const complementEl = document.getElementById('complement');
        if (complementEl) complement = complementEl.value.trim();
        
        if (!street || !neighborhood) {
          alert('Por favor, preencha a rua e o bairro para a entrega.');
          return;
        }
      }
      
      let subtotal = 0;
      cart.forEach(item => {
        subtotal += item.price * item.quantity;
      });
      
      const deliveryFee = deliveryType === 'delivery' ? 5.00 : 0.00;
      const total = subtotal + deliveryFee;
      
      // Compile formatted WhatsApp message
      let msg = `*NOVO PEDIDO - MORADA DO AÇAÍ* 💚\n`;
      msg += `----------------------------------\n`;
      msg += `👤 *Cliente*: ${name}\n`;
      msg += `📞 *WhatsApp*: ${phone}\n\n`;
      
      msg += `🛍️ *Itens do Pedido*:\n`;
      cart.forEach(item => {
        msg += `• ${item.quantity}x ${item.name} - ${formatCurrency(item.price * item.quantity)}\n`;
        if (item.isCustom && item.details) {
          const d = item.details;
          if (d.cremes && d.cremes.length > 0) {
            msg += `  └ Cremes: ${d.cremes.join(', ')}\n`;
          }
          if (d.frutas && d.frutas.length > 0) {
            msg += `  └ Frutas: ${d.frutas.join(', ')}\n`;
          }
          if (d.toppings && d.toppings.length > 0) {
            msg += `  └ Adicionais: ${d.toppings.join(', ')}\n`;
          }
        }
      });
      msg += `\n`;
      
      msg += `----------------------------------\n`;
      if (deliveryType === 'delivery') {
        msg += `🛵 *Tipo*: Delivery\n`;
        msg += `📍 *Endereço*: ${street} - ${neighborhood}\n`;
        if (complement) {
          msg += `📍 *Ref/Comp*: ${complement}\n`;
        }
      } else {
        msg += `🛵 *Tipo*: Retirada no Local\n`;
      }
      
      const paymentLabels = {
        pix: 'Pix',
        cartao: 'Cartão de Crédito / Débito',
        dinheiro: 'Dinheiro'
      };
      msg += `💳 *Pagamento*: ${paymentLabels[payment] || payment}\n`;
      if (payment === 'dinheiro' && change) {
        msg += `💵 *Troco para*: R$ ${change}\n`;
      }
      msg += `\n`;
      
      msg += `💰 *Subtotal*: ${formatCurrency(subtotal)}\n`;
      if (deliveryType === 'delivery') {
        msg += `🛵 *Taxa de Entrega*: ${formatCurrency(deliveryFee)}\n`;
      }
      msg += `💵 *Total*: ${formatCurrency(total)}\n`;
      
      // WhatsApp Direct Link
      const whatsappNumber = '557133577733';
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
      
      // Clear local state & elements
      cart = [];
      saveCart();
      closeCart();
      checkoutForm.reset();
      
      alert('Pedido enviado com sucesso para o WhatsApp!');
    });
  }

  // Initial Cart Rendering
  updateCartUI();

  // Specialties Carousel
  const track = document.getElementById('carouselTrack');
  if (track) {
    const cards = Array.from(track.children);
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const dotsContainer = document.getElementById('carouselDots');
    let currentIndex = 0;

    function getCardsInView() {
      return window.innerWidth > 768 ? 2 : 1;
    }

    function getMaxIndex() {
      return Math.max(0, cards.length - getCardsInView());
    }

    function setupDots() {
      dotsContainer.innerHTML = '';
      const maxIndex = getMaxIndex();
      for (let i = 0; i <= maxIndex; i++) {
        const dot = document.createElement('button');
        dot.classList.add('carousel-dot');
        if (i === currentIndex) dot.classList.add('active');
        dot.addEventListener('click', () => {
          currentIndex = i;
          updateCarousel();
        });
        dotsContainer.appendChild(dot);
      }
    }

    function updateCarousel() {
      const maxIndex = getMaxIndex();
      if (currentIndex > maxIndex) currentIndex = maxIndex;
      if (currentIndex < 0) currentIndex = 0;

      const cardWidth = cards[0].getBoundingClientRect().width;
      const style = window.getComputedStyle(track);
      const gap = parseFloat(style.columnGap || style.gap) || 0;

      const moveAmount = currentIndex * (cardWidth + gap);
      track.style.transform = `translateX(-${moveAmount}px)`;

      // Update dots
      const dots = Array.from(dotsContainer.children);
      if (dots.length !== maxIndex + 1) {
        setupDots();
      } else {
        dots.forEach((dot, idx) => {
          dot.classList.toggle('active', idx === currentIndex);
        });
      }

      // Update button states
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex === maxIndex;
    }

    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    });

    nextBtn.addEventListener('click', () => {
      if (currentIndex < getMaxIndex()) {
        currentIndex++;
        updateCarousel();
      }
    });

    // Touch Swipe Logic for Mobile
    let startX = 0;
    let isDragging = false;

    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      const endX = e.changedTouches[0].clientX;
      const diffX = endX - startX;

      if (Math.abs(diffX) > 40) {
        if (diffX > 0 && currentIndex > 0) {
          currentIndex--;
        } else if (diffX < 0 && currentIndex < getMaxIndex()) {
          currentIndex++;
        }
        updateCarousel();
      }
      isDragging = false;
    });

    // Initialize carousel
    setupDots();
    updateCarousel();

    // Re-setup on window resize
    window.addEventListener('resize', () => {
      setupDots();
      updateCarousel();
    });
  }

  // Lazy load images with fade-in effect
  const images = document.querySelectorAll('img');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.5s ease';

        if (img.complete) {
          img.style.opacity = '1';
        } else {
          img.addEventListener('load', () => {
            img.style.opacity = '1';
          });
        }

        imageObserver.unobserve(img);
      }
    });
  }, { threshold: 0.1 });

  images.forEach(img => imageObserver.observe(img));

  // Cardapio Filters & Header Links Integration
  const filterButtons = document.querySelectorAll('.filter-btn');
  const catalogCards = document.querySelectorAll('.menu-catalog-card');

  if (filterButtons.length > 0 && catalogCards.length > 0) {
    function applyFilter(category) {
      // Find matching button
      const targetBtn = Array.from(filterButtons).find(btn => btn.getAttribute('data-filter') === category);
      if (!targetBtn) return;

      filterButtons.forEach(b => b.classList.remove('active'));
      targetBtn.classList.add('active');

      catalogCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (category === 'todos' || cardCategory === category) {
          card.classList.remove('hidden');
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          }, 30);
        } else {
          card.classList.add('hidden');
        }
      });
    }

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.getAttribute('data-filter');
        applyFilter(category);
        
        // Update URL query parameter without page reload if desired
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?filter=' + category;
        window.history.pushState({ path: newUrl }, '', newUrl);
      });
    });

    // Check for query parameter 'filter' on load
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');
    if (filterParam) {
      applyFilter(filterParam);
    }

    // Dynamic header navigation links behavior
    document.querySelectorAll('.nav-links a').forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.includes('filter=')) {
        const category = href.split('filter=')[1];
        link.addEventListener('click', (e) => {
          if (window.location.pathname.includes('cardapio.html')) {
            e.preventDefault();
            applyFilter(category);
          }
        });
      }
    });
  }
});
