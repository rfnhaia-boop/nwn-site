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
}

// --- CALCULADORA INTERATIVA ---
function initCalculator() {
    const calcItems = document.querySelectorAll('.calc-item');
    const summaryList = document.getElementById('summary-list');
    const totalDisplay = document.getElementById('total-display');
    const btnSendBudget = document.getElementById('btn-send-budget');
    
    if (!totalDisplay) return;

    let selectedAddons = new Map();

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
            
            updateBudgetSummary(selectedAddons, totalDisplay, summaryList, btnSendBudget);
        });
    });

    // Inicializa a calculadora com o preço base
    updateBudgetSummary(selectedAddons, totalDisplay, summaryList, btnSendBudget);
}

// Atualiza o HTML do resumo do orçamento
function updateBudgetSummary(addons, totalDisplay, summaryList, btnSendBudget) {
    let total = CONFIG.basePrice;
    
    // Esvazia lista de resumo
    summaryList.innerHTML = '';
    
    // Adiciona o item Base
    const baseItemHTML = `
        <div class="summary-list-item">
            <span>Site Profissional (Campanha Promo)</span>
            <span>R$ ${CONFIG.basePrice.toFixed(2).replace('.', ',')}</span>
        </div>
    `;
    summaryList.insertAdjacentHTML('beforeend', baseItemHTML);
    
    // Adiciona adicionais selecionados
    addons.forEach((details) => {
        total += details.price;
        const addonHTML = `
            <div class="summary-list-item">
                <span>+ ${details.name}</span>
                <span>R$ ${details.price.toFixed(2).replace('.', ',')}</span>
            </div>
        `;
        summaryList.insertAdjacentHTML('beforeend', addonHTML);
    });
    
    // Atualiza exibição de preço
    totalDisplay.textContent = `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    // Atualiza link do WhatsApp de solicitação de orçamento
    if (btnSendBudget) {
        let text = `Olá! Vi o site e quero garantir a promoção de R$ ${CONFIG.basePrice}. \n\n`;
        if (addons.size > 0) {
            text += `Gostaria de incluir as seguintes integrações/adicionais:\n`;
            addons.forEach(details => {
                text += `• ${details.name} (+ R$ ${details.price})\n`;
            });
            text += `\n`;
        }
        text += `Valor estimado personalizado: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
        text += `Podemos agendar uma call para conversar sobre o meu projeto?`;
        
        const encodedText = encodeURIComponent(text);
        btnSendBudget.href = `https://api.whatsapp.com/send?phone=${CONFIG.whatsappNumber}&text=${encodedText}`;
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
    
    if (!tabs.length) return;

    // Project Tabs logic
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const project = tab.getAttribute('data-project');
            
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
