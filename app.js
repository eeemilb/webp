// Telegram Web App initialization
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Data structure
const appData = {
    categories: [
        {
            id: 'tutorials',
            name: 'Tutorials & Guides',
            emoji: '📚',
            description: 'Learning materials and guides'
        },
        {
            id: 'tools',
            name: 'Tools & Resources',
            emoji: '🛠️',
            description: 'Software and design tools'
        },
        {
            id: 'communities',
            name: 'Communities',
            emoji: '👥',
            description: 'Forums and communities'
        },
        {
            id: 'documentation',
            name: 'Documentation',
            emoji: '📖',
            description: 'Technical documentation'
        },
        {
            id: 'projects',
            name: 'My Projects',
            emoji: '🚀',
            description: 'Personal projects'
        },
        {
            id: 'suppliers',
            name: 'Suppliers',
            emoji: '🏪',
            description: 'Component suppliers'
        }
    ],
    links: [
        // Tutorials
        {
            id: 1,
            title: 'EDM Basics Explained',
            url: 'https://example.com/edm-guide',
            description: 'Complete guide to electro-erosion machining',
            emoji: '⚡',
            category: 'tutorials'
        },
        {
            id: 2,
            title: 'High-Frequency Pulse Generation',
            url: 'https://example.com/hfpg',
            description: 'Understanding pulse waveforms for EDM',
            emoji: '📊',
            category: 'tutorials'
        },
        {
            id: 3,
            title: 'STM32 Programming for EDM',
            url: 'https://example.com/stm32-edm',
            description: 'Microcontroller programming guide',
            emoji: '💻',
            category: 'tutorials'
        },
        // Tools
        {
            id: 4,
            title: 'EasyEDA - PCB Design',
            url: 'https://easyeda.com',
            description: 'PCB design and simulation platform',
            emoji: '📐',
            category: 'tools'
        },
        {
            id: 5,
            title: 'Fusion 360 CAD',
            url: 'https://fusion360.autodesk.com',
            description: 'Professional 3D CAD software',
            emoji: '🎨',
            category: 'tools'
        },
        {
            id: 6,
            title: 'STM32CubeMX',
            url: 'https://www.st.com/en/development-tools/stm32cubemx.html',
            description: 'STM32 microcontroller configuration tool',
            emoji: '⚙️',
            category: 'tools'
        },
        // Communities
        {
            id: 7,
            title: 'Russian Electronics Forum',
            url: 'https://radiokot.ru',
            description: 'Electronics engineering community',
            emoji: '🌐',
            category: 'communities'
        },
        {
            id: 8,
            title: 'Telegram EDM Builders Group',
            url: 'https://t.me',
            description: 'Community of EDM machine builders',
            emoji: '🔗',
            category: 'communities'
        },
        {
            id: 9,
            title: 'GitHub Open EDM Projects',
            url: 'https://github.com/topics/edm',
            description: 'Open source EDM projects',
            emoji: '📦',
            category: 'communities'
        },
        // Documentation
        {
            id: 10,
            title: 'STM32 Datasheets',
            url: 'https://www.st.com/resource/en/datasheet',
            description: 'Complete microcontroller specifications',
            emoji: '📄',
            category: 'documentation'
        },
        {
            id: 11,
            title: 'High-Frequency Power Electronics',
            url: 'https://example.com/hf-power',
            description: 'Advanced power electronics theory',
            emoji: '⚡',
            category: 'documentation'
        },
        {
            id: 12,
            title: 'PCB Design Best Practices',
            url: 'https://example.com/pcb-practices',
            description: 'Professional PCB design guidelines',
            emoji: '✓',
            category: 'documentation'
        },
        // Projects
        {
            id: 13,
            title: 'EDM Machine Prototype',
            url: 'https://example.com/edm-project',
            description: 'Main EDM machine development',
            emoji: '🤖',
            category: 'projects'
        },
        {
            id: 14,
            title: 'Custom Pulse Generator',
            url: 'https://example.com/pulse-gen',
            description: 'High-frequency pulse generation circuit',
            emoji: '〰️',
            category: 'projects'
        },
        {
            id: 15,
            title: 'Control Board Design',
            url: 'https://example.com/control-board',
            description: 'Main control and measurement board',
            emoji: '🎛️',
            category: 'projects'
        },
        // Suppliers
        {
            id: 16,
            title: 'ChipDip - Electronic Components',
            url: 'https://www.chipdip.ru',
            description: 'Russian electronics component supplier',
            emoji: '🛒',
            category: 'suppliers'
        },
        {
            id: 17,
            title: 'Industrial Equipment',
            url: 'https://example.com/equipment',
            description: 'Industrial machinery and components',
            emoji: '🏭',
            category: 'suppliers'
        },
        {
            id: 18,
            title: 'PCB Manufacturing Services',
            url: 'https://example.com/pcb-mfg',
            description: 'Professional PCB fabrication',
            emoji: '🔧',
            category: 'suppliers'
        }
    ]
};

// State management
let state = {
    currentCategory: 'tutorials',
    editMode: false,
    editingLinkId: null,
    searchQuery: ''
};

// Initialize Telegram user profile
function initTelegramUser() {
    const user = tg.initDataUnsafe.user;
    
    if (user) {
        const userName = document.getElementById('userName');
        const userUsername = document.getElementById('userUsername');
        const userAvatar = document.getElementById('userAvatar');
        
        userName.textContent = user.first_name || 'User';
        userUsername.textContent = user.username ? `@${user.username}` : '';
        
        if (user.photo_url) {
            userAvatar.innerHTML = `<img src="${user.photo_url}" alt="${user.first_name}">`;
        } else {
            userAvatar.textContent = user.first_name ? user.first_name.charAt(0).toUpperCase() : '👤';
        }
    }
}

// Render categories navigation
function renderCategories() {
    const categoriesNav = document.getElementById('categoriesNav');
    categoriesNav.innerHTML = appData.categories.map(cat => `
        <button class="category-btn ${state.currentCategory === cat.id ? 'active' : ''}" 
                data-category="${cat.id}">
            <span>${cat.emoji}</span>
            <span>${cat.name}</span>
        </button>
    `).join('');
    
    // Add event listeners
    categoriesNav.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.currentCategory = btn.dataset.category;
            renderApp();
        });
    });
}

// Render section header
function renderSectionHeader() {
    const sectionHeader = document.getElementById('sectionHeader');
    const category = appData.categories.find(cat => cat.id === state.currentCategory);
    const links = getFilteredLinks();
    
    sectionHeader.innerHTML = `
        <span class="section-icon">${category.emoji}</span>
        <h2 class="section-title">${category.name}</h2>
        <span class="section-count">${links.length} ссылок</span>
    `;
}

// Get filtered links
function getFilteredLinks() {
    let links = appData.links.filter(link => link.category === state.currentCategory);
    
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        links = links.filter(link => 
            link.title.toLowerCase().includes(query) ||
            link.description.toLowerCase().includes(query)
        );
    }
    
    return links;
}

// Render links
function renderLinks() {
    const linksGrid = document.getElementById('linksGrid');
    const links = getFilteredLinks();
    
    if (links.length === 0) {
        linksGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <div class="empty-text">
                    ${state.searchQuery ? 'Ничего не найдено' : 'В этой категории пока нет ссылок'}
                </div>
            </div>
        `;
        return;
    }
    
    linksGrid.innerHTML = links.map(link => `
        <div class="link-card" data-link-id="${link.id}">
            <div class="link-header">
                <div class="link-emoji">${link.emoji}</div>
                <div class="link-info">
                    <div class="link-title">${link.title}</div>
                    <div class="link-description">${link.description}</div>
                    <div class="link-url">${link.url}</div>
                </div>
            </div>
            <div class="link-actions ${state.editMode ? 'visible' : ''}">
                <button class="link-action-btn link-edit-btn" data-action="edit">✏️ Редактировать</button>
                <button class="link-action-btn link-delete-btn" data-action="delete">🗑️ Удалить</button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners
    linksGrid.querySelectorAll('.link-card').forEach(card => {
        const linkId = parseInt(card.dataset.linkId);
        const link = appData.links.find(l => l.id === linkId);
        
        // Click to open link
        card.addEventListener('click', (e) => {
            if (e.target.closest('.link-action-btn')) return;
            if (!state.editMode) {
                window.open(link.url, '_blank');
            }
        });
        
        // Edit button
        const editBtn = card.querySelector('[data-action="edit"]');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openEditModal(linkId);
            });
        }
        
        // Delete button
        const deleteBtn = card.querySelector('[data-action="delete"]');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteLink(linkId);
            });
        }
    });
}

// Toggle edit mode
function toggleEditMode() {
    state.editMode = !state.editMode;
    const manageBtnText = document.getElementById('manageBtnText');
    manageBtnText.textContent = state.editMode ? 'Готово' : 'Управление';
    renderLinks();
}

// Open add link modal
function openAddModal() {
    state.editingLinkId = null;
    const modal = document.getElementById('linkModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('linkForm');
    
    modalTitle.textContent = 'Добавить ссылку';
    form.reset();
    
    // Populate category dropdown
    const categorySelect = document.getElementById('linkCategory');
    categorySelect.innerHTML = appData.categories.map(cat => 
        `<option value="${cat.id}" ${cat.id === state.currentCategory ? 'selected' : ''}>
            ${cat.emoji} ${cat.name}
        </option>`
    ).join('');
    
    modal.classList.add('active');
}

// Open edit link modal
function openEditModal(linkId) {
    state.editingLinkId = linkId;
    const link = appData.links.find(l => l.id === linkId);
    if (!link) return;
    
    const modal = document.getElementById('linkModal');
    const modalTitle = document.getElementById('modalTitle');
    
    modalTitle.textContent = 'Редактировать ссылку';
    
    // Populate form
    document.getElementById('linkTitle').value = link.title;
    document.getElementById('linkUrl').value = link.url;
    document.getElementById('linkEmoji').value = link.emoji;
    document.getElementById('linkDescription').value = link.description;
    
    // Populate category dropdown
    const categorySelect = document.getElementById('linkCategory');
    categorySelect.innerHTML = appData.categories.map(cat => 
        `<option value="${cat.id}" ${cat.id === link.category ? 'selected' : ''}>
            ${cat.emoji} ${cat.name}
        </option>`
    ).join('');
    
    modal.classList.add('active');
}

// Close modal
function closeModal() {
    const modal = document.getElementById('linkModal');
    modal.classList.remove('active');
    state.editingLinkId = null;
}

// Save link
function saveLink(e) {
    e.preventDefault();
    
    const title = document.getElementById('linkTitle').value;
    const url = document.getElementById('linkUrl').value;
    const category = document.getElementById('linkCategory').value;
    const emoji = document.getElementById('linkEmoji').value || '🔗';
    const description = document.getElementById('linkDescription').value;
    
    if (state.editingLinkId) {
        // Edit existing link
        const link = appData.links.find(l => l.id === state.editingLinkId);
        if (link) {
            link.title = title;
            link.url = url;
            link.category = category;
            link.emoji = emoji;
            link.description = description;
        }
    } else {
        // Add new link
        const newLink = {
            id: Date.now(),
            title,
            url,
            category,
            emoji,
            description
        };
        appData.links.push(newLink);
    }
    
    closeModal();
    renderApp();
}

// Delete link
function deleteLink(linkId) {
    if (confirm('Вы уверены, что хотите удалить эту ссылку?')) {
        const index = appData.links.findIndex(l => l.id === linkId);
        if (index > -1) {
            appData.links.splice(index, 1);
            renderApp();
        }
    }
}

// Show all categories (menu)
function showAllCategories() {
    const categoriesNav = document.getElementById('categoriesNav');
    categoriesNav.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Search functionality
function showSearch() {
    const query = prompt('Введите текст для поиска:');
    if (query !== null) {
        state.searchQuery = query.trim();
        renderApp();
    }
}

// Render entire app
function renderApp() {
    renderCategories();
    renderSectionHeader();
    renderLinks();
}

// Initialize app
function init() {
    initTelegramUser();
    renderApp();
    
    // Event listeners
    document.getElementById('addLinkBtn').addEventListener('click', openAddModal);
    document.getElementById('manageBtn').addEventListener('click', toggleEditMode);
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('linkForm').addEventListener('submit', saveLink);
    
    // Bottom nav
    document.getElementById('homeBtn').addEventListener('click', () => {
        state.currentCategory = 'tutorials';
        state.searchQuery = '';
        renderApp();
        
        // Update active state
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('homeBtn').classList.add('active');
    });
    
    document.getElementById('menuBtn').addEventListener('click', () => {
        showAllCategories();
        
        // Update active state
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('menuBtn').classList.add('active');
    });
    
    document.getElementById('searchBtn').addEventListener('click', () => {
        showSearch();
        
        // Update active state
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('searchBtn').classList.add('active');
    });
    
    // Close modal on outside click
    document.getElementById('linkModal').addEventListener('click', (e) => {
        if (e.target.id === 'linkModal') {
            closeModal();
        }
    });
}

// Start the app
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}