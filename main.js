// --- CONFIGURAÇÕES DO SITE ---
const CONFIG = {
    whatsappNumber: '5511999999999', // Substitua pelo seu número do WhatsApp (com DDI e DDD)
    instagramUser: 'seu.instagram',   // Substitua pelo seu usuário do Instagram
    basePrice: 850,                   // Preço promocional base
    originalPrice: 2500,              // Preço original sem desconto
    completedPromoSites: 3,           // Quantos sites já foram vendidos na promoção
    totalPromoSites: 10               // Total de sites na promoção
};

// --- INICIALIZAÇÃO E EVENTOS ---
document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initMobileMenu();
    initPromoProgress();
    initCalculator();
    initFAQ();
    initScrollReveal();
    updateContactLinks();
    initShowcase();
});

// Altera estilo do header ao rolar a página
function initHeaderScroll() {
    const header = document.querySelector('header');
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        // Header background on scroll
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Active nav link highlighting
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('nav-active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('nav-active');
            }
        });
    });
}

// Menu hamburger para mobile
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (!hamburger || !navLinks) return;
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });
    
    // Close menu when clicking a nav link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');
            document.body.style.overflow = '';
        });
    });
}

// Atualiza a barra de progresso da promoção dinamicamente
function initPromoProgress() {
    const fill = document.getElementById('promo-fill');
    const label = document.getElementById('promo-count');
    
    if (fill && label) {
        const percentage = (CONFIG.completedPromoSites / CONFIG.totalPromoSites) * 100;
        fill.style.width = `${percentage}%`;
        label.textContent = `${CONFIG.completedPromoSites} de ${CONFIG.totalPromoSites} sites já garantidos!`;
        
        // Atualiza a contagem restante
        const remaining = CONFIG.totalPromoSites - CONFIG.completedPromoSites;
        const remainingLabel = document.getElementById('promo-remaining');
        if (remainingLabel) {
            remainingLabel.textContent = `Restam apenas ${remaining} vagas nesse valor promocional.`;
        }
    }
}

// Atualiza links de contato dinamicamente baseados na configuração
function updateContactLinks() {
    const instagramLinks = document.querySelectorAll('.instagram-link');
    instagramLinks.forEach(link => {
        link.href = `https://instagram.com/${CONFIG.instagramUser}`;
        if (link.tagName === 'SPAN' || link.classList.contains('username-placeholder')) {
            link.textContent = `@${CONFIG.instagramUser}`;
        }
    });

    const whatsappDirectButtons = document.querySelectorAll('.btn-whatsapp-direct');
    whatsappDirectButtons.forEach(btn => {
        const text = encodeURIComponent('Olá! Vi a promoção de sites por R$ 850 e gostaria de saber mais informações.');
        btn.href = `https://api.whatsapp.com/send?phone=${CONFIG.whatsappNumber}&text=${text}`;
    });

    const whatsappCareButtons = document.querySelectorAll('.btn-whatsapp-care');
    whatsappCareButtons.forEach(btn => {
        const text = encodeURIComponent('Olá! Gostaria de saber mais e garantir minha vaga no Plano Cuidado NWN por R$ 250/mês.');
        btn.href = `https://api.whatsapp.com/send?phone=${CONFIG.whatsappNumber}&text=${text}`;
    });
}

// --- CALCULADORA INTERATIVA ---
function initCalculator() {
    const calcItems = document.querySelectorAll('.calc-item');
    const radioItems = document.querySelectorAll('.calc-radio-item');
    const setupList = document.getElementById('summary-setup-list');
    const monthlyList = document.getElementById('summary-monthly-list');
    const setupTotalDisplay = document.getElementById('setup-total-display');
    const monthlyTotalDisplay = document.getElementById('monthly-total-display');
    const btnSendBudget = document.getElementById('btn-send-budget');
    
    if (!setupTotalDisplay || !monthlyTotalDisplay) return;

    let selectedAddons = new Map();
    let selectedHostingId = 'hosting-care'; // Padrão: Plano Cuidado NWN

    // Checkbox items (features)
    calcItems.forEach(item => {
        item.addEventListener('click', () => {
            const addonId = item.getAttribute('data-id');
            const addonName = item.querySelector('.calc-item-title').textContent;
            const addonPrice = parseFloat(item.getAttribute('data-price'));
            
            if (item.classList.contains('active')) {
                item.classList.remove('active');
                selectedAddons.delete(addonId);
            } else {
                item.classList.add('active');
                selectedAddons.set(addonId, { name: addonName, price: addonPrice });
            }
            
            updateBudgetSummary(selectedAddons, selectedHostingId, setupList, monthlyList, setupTotalDisplay, monthlyTotalDisplay, btnSendBudget);
        });
    });

    // Radio items (hosting)
    radioItems.forEach(radio => {
        radio.addEventListener('click', () => {
            radioItems.forEach(r => r.classList.remove('active'));
            radio.classList.add('active');
            selectedHostingId = radio.getAttribute('data-id');
            
            updateBudgetSummary(selectedAddons, selectedHostingId, setupList, monthlyList, setupTotalDisplay, monthlyTotalDisplay, btnSendBudget);
        });
    });

    // Inicializa a calculadora com as seleções padrão
    updateBudgetSummary(selectedAddons, selectedHostingId, setupList, monthlyList, setupTotalDisplay, monthlyTotalDisplay, btnSendBudget);
}

// Atualiza o HTML do resumo do orçamento
function updateBudgetSummary(addons, hostingId, setupList, monthlyList, setupTotalDisplay, monthlyTotalDisplay, btnSendBudget) {
    let setupTotal = CONFIG.basePrice;
    let monthlyTotal = 0;
    
    // Esvazia as duas listas
    setupList.innerHTML = '';
    monthlyList.innerHTML = '';
    
    // 1. Adiciona o item Base do Site no Setup
    const baseItemHTML = `
        <div class="summary-list-item">
            <span>Site Profissional (Campanha Promo)</span>
            <span>R$ ${CONFIG.basePrice.toFixed(2).replace('.', ',')}</span>
        </div>
    `;
    setupList.insertAdjacentHTML('beforeend', baseItemHTML);
    
    // 2. Adiciona adicionais selecionados no Setup
    let addonsTextMsg = '';
    if (addons.size > 0) {
        addons.forEach((details) => {
            setupTotal += details.price;
            const addonHTML = `
                <div class="summary-list-item">
                    <span>+ ${details.name}</span>
                    <span>R$ ${details.price.toFixed(2).replace('.', ',')}</span>
                </div>
            `;
            setupList.insertAdjacentHTML('beforeend', addonHTML);
            addonsTextMsg += `  - ${details.name} (+ R$ ${details.price})\n`;
        });
    } else {
        addonsTextMsg = '  - Nenhum adicional (Apenas Site Promocional)\n';
    }

    // 3. Adiciona a Hospedagem selecionada no Mensal
    const selectedRadio = document.querySelector(`.calc-radio-item[data-id="${hostingId}"]`);
    let hostingName = 'Plano Cuidado NWN';
    if (selectedRadio) {
        // Se for independente, o custo para a NWN é R$ 0, pois o cliente contrata e paga diretamente ao provedor
        if (hostingId === 'hosting-independent') {
            monthlyTotal = 0;
            hostingName = 'Hospedagem Própria (Independente)';
        } else {
            monthlyTotal = parseFloat(selectedRadio.getAttribute('data-monthly'));
            hostingName = selectedRadio.querySelector('.calc-item-title').textContent.replace(' Recomendado', '');
        }
        
        const hostingHTML = `
            <div class="summary-list-item">
                <span>${hostingName}</span>
                <span>R$ ${monthlyTotal.toFixed(2).replace('.', ',')}/mês</span>
            </div>
        `;
        monthlyList.insertAdjacentHTML('beforeend', hostingHTML);
    }
    
    // Atualiza os displays de preço
    setupTotalDisplay.textContent = `R$ ${setupTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    monthlyTotalDisplay.textContent = `R$ ${monthlyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mês`;
    
    // Atualiza o texto do botão principal e o link do WhatsApp
    const btnCalcText = document.getElementById('btn-calc-text');
    const setupTotalFormatted = setupTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const monthlyTotalFormatted = monthlyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    let isCarePlan = (hostingId === 'hosting-care');
    
    if (btnCalcText) {
        btnCalcText.textContent = isCarePlan ? 'Garantir Vaga + Plano Cuidado' : 'Garantir Apenas o Site';
    }
    
    // Constrói mensagem comercial do WhatsApp do checkout da calculadora
    const msg = `Olá NWN Studio! Montei meu orçamento no site.\n\n` +
                `--- CRIAÇÃO DO SITE ---\n` +
                `• Criação & Desenvolvimento: R$ ${setupTotalFormatted}\n` +
                `• Funcionalidades Escolhidas:\n${addonsTextMsg}\n` +
                `--- HOSPEDAGEM & SUPORTE ---\n` +
                `• Plano: ${hostingName} (R$ ${monthlyTotalFormatted}/mês)\n\n` +
                `Gostaria de fechar o projeto com essas configurações e garantir minha vaga!`;
                
    if (btnSendBudget) {
        btnSendBudget.href = `https://api.whatsapp.com/send?phone=${CONFIG.whatsappNumber}&text=${encodeURIComponent(msg)}`;
    }
    
    // Sincroniza também os botões da tabela comparativa abaixo
    const btnSelectIndependent = document.getElementById('btn-select-independent');
    const btnSelectCare = document.getElementById('btn-select-care');
    
    if (btnSelectIndependent) {
        const textInd = `Olá! Montei meu orçamento no site da NWN Studio.\n\n• Investimento do Site: R$ ${setupTotalFormatted}\n${addonsTextMsg.replace(/  -/g, '•')}\n• Hospedagem: Independente (contratada por mim)\n\nGostaria de iniciar o projeto com essas configurações.`;
        btnSelectIndependent.href = `https://api.whatsapp.com/send?phone=${CONFIG.whatsappNumber}&text=${encodeURIComponent(textInd)}`;
    }
    
    if (btnSelectCare) {
        const textCare = `Olá! Montei meu orçamento no site da NWN Studio.\n\n• Investimento do Site: R$ ${setupTotalFormatted}\n${addonsTextMsg.replace(/  -/g, '•')}\n• Hospedagem: Plano Cuidado NWN (Incluso suporte + relatórios + R$ 250,00/mês)\n\nGostaria de fechar o projeto e garantir a vaga no Plano Cuidado.`;
        btnSelectCare.href = `https://api.whatsapp.com/send?phone=${CONFIG.whatsappNumber}&text=${encodeURIComponent(textCare)}`;
    }
}

// --- ACORDEÃO DO FAQ ---
function initFAQ() {
    const faqHeaders = document.querySelectorAll('.faq-header');
    
    faqHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const currentItem = header.parentElement;
            const isActive = currentItem.classList.contains('active');
            
            // Fecha todos os FAQs ativos
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Abre o FAQ atual se ele não estava ativo
            if (!isActive) {
                currentItem.classList.add('active');
            }
        });
    });
}

// --- ANIMATIONS (SCROLL REVEAL) ---
function initScrollReveal() {
    const items = document.querySelectorAll('.glass-card, .section-title, .section-subtitle, .promo-box, .process-step');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    items.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(item);
    });
}

// --- PORTFOLIO INTERACTIVE SHOWCASE ---
function initShowcase() {
    const tabs = document.querySelectorAll('.showcase-tab');
    const projectDetails = document.querySelectorAll('.project-details');
    const iframe = document.getElementById('portfolio-iframe');
    const urlDisplay = document.getElementById('mock-url-display');
    const previewContainer = document.getElementById('preview-frame-container');
    const deviceButtons = document.querySelectorAll('.btn-device');
    
    const fallbackCeasa = document.getElementById('fallback-ceasa');
    const fallbackVita = document.getElementById('fallback-vita');
    const loader = document.getElementById('viewport-loader');
    
    if (!tabs.length) return;

    // Hide loader once the iframe has finished loading
    if (iframe && loader) {
        iframe.addEventListener('load', () => {
            loader.classList.add('hidden');
        });
    }

    // Project Tabs logic
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const project = tab.getAttribute('data-project');
            
            // Show loader during transition
            if (loader) loader.classList.remove('hidden');
            
            // Toggle active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Toggle details info
            projectDetails.forEach(detail => {
                detail.classList.add('hidden');
            });
            const currentDetail = document.getElementById(`details-${project}`);
            if (currentDetail) currentDetail.classList.remove('hidden');
            
            // Reset mock device frame to desktop when changing projects
            if (previewContainer) {
                previewContainer.classList.remove('mobile');
                previewContainer.classList.add('desktop');
            }
            deviceButtons.forEach(b => {
                if (b.getAttribute('data-device') === 'desktop') {
                    b.classList.add('active');
                } else {
                    b.classList.remove('active');
                }
            });
            
            // Update preview frame / fallback view
            if (project === 'morada') {
                if (iframe) iframe.classList.remove('hidden');
                if (fallbackCeasa) fallbackCeasa.classList.add('hidden');
                if (fallbackVita) fallbackVita.classList.add('hidden');
                if (iframe) iframe.src = 'projects/morada-do-acai/index.html';
                if (urlDisplay) urlDisplay.textContent = 'nwnstudio.com.br/projects/morada-do-acai';
            } else if (project === 'balbo') {
                if (iframe) iframe.classList.remove('hidden');
                if (fallbackCeasa) fallbackCeasa.classList.add('hidden');
                if (fallbackVita) fallbackVita.classList.add('hidden');
                if (iframe) iframe.src = 'https://isabelabalbo.vercel.app/';
                if (urlDisplay) urlDisplay.textContent = 'isabelabalbo.adv.br';
            } else if (project === 'vita') {
                if (iframe) iframe.classList.add('hidden');
                if (fallbackCeasa) fallbackCeasa.classList.add('hidden');
                if (fallbackVita) fallbackVita.classList.remove('hidden');
                if (urlDisplay) urlDisplay.textContent = 'nwnstudio.com.br/projects/clinica-vita';
                if (loader) loader.classList.add('hidden'); // Hide immediately since there is no iframe load event
            }
        });
    });

    // Device Toggles logic
    deviceButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const device = btn.getAttribute('data-device');
            
            // Toggle button styling
            deviceButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update iframe wrapper styling
            if (previewContainer) {
                if (device === 'mobile') {
                    previewContainer.classList.remove('desktop');
                    previewContainer.classList.add('mobile');
                } else {
                    previewContainer.classList.remove('mobile');
                    previewContainer.classList.add('desktop');
                }
            }
        });
    });
}
