// Telegram Web App initialization
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Admin configuration
const ADMIN_USERNAME = 'eee_h1';

// Current user state
let currentUser = {
    username: '',
    firstName: '',
    photoUrl: '',
    isAdmin: false
};

// Default data structure
const defaultData = {
    categories: [
        {
            id: 'boards',
            name: '🔌 Платы',
            emoji: '🔌',
            type: 'links',
            description: 'Ссылки на платы и PCB ресурсы'
        },
        {
            id: 'schemas',
            name: '📊 Схемы',
            emoji: '📊',
            type: 'links',
            description: 'Ссылки на электрические схемы'
        },
        {
            id: 'communication',
            name: '💬 Коммуникация',
            emoji: '💬',
            type: 'chat',
            description: 'Общий чат для обсуждения'
        }
    ],
    links: [
        {
            id: 1,
            title: 'STM32H7 Discovery Kit',
            url: 'https://www.st.com/en/evaluation-tools/h735i-dk.html',
            description: 'Отладочная плата с мощным микроконтроллером',
            emoji: '⚙️',
            category: 'boards'
        },
        {
            id: 2,
            title: 'Arduino Mega 2560',
            url: 'https://www.arduino.cc/',
            description: 'Популярная платформа для прототипирования',
            emoji: '🎛️',
            category: 'boards'
        },
        {
            id: 3,
            title: 'Raspberry Pi 4',
            url: 'https://www.raspberrypi.org/',
            description: 'Мини-компьютер для сложных проектов',
            emoji: '🖥️',
            category: 'boards'
        },
        {
            id: 4,
            title: 'Блок питания EDM',
            url: 'https://example.com/edm-psu',
            description: 'Высоковольтный источник питания для электроэрозии',
            emoji: '⚡',
            category: 'schemas'
        },
        {
            id: 5,
            title: 'Высокочастотный генератор',
            url: 'https://example.com/hfo',
            description: 'Генератор импульсов 100-200 кГц',
            emoji: '📡',
            category: 'schemas'
        },
        {
            id: 6,
            title: 'Схема генератора импульсов',
            url: 'https://example.com/pulse',
            description: 'Полная схема с описанием компонентов',
            emoji: '📋',
            category: 'schemas'
        }
    ],
    messages: [
        {
            id: 1,
            username: 'eee_h1',
            displayName: 'Emil',
            avatarUrl: '',
            message: 'Добро пожаловать в канал! Здесь мы обсуждаем проекты EDM и электроэрозионную обработку',
            timestamp: Date.now(),
            isAdmin: true
        }
    ]
};

// App data (loaded from localStorage or default)
let appData = JSON.parse(JSON.stringify(defaultData));

// State management
let state = {
    currentCategory: 'boards',
    editMode: false,
    editingLinkId: null
};

// Save data to memory (in production, this would sync to Google Sheets)
function saveData() {
    console.log('Data saved to memory (ready for Google Sheets integration)');
}

// Initialize Telegram user profile
function initTelegramUser() {
    const user = tg.initDataUnsafe.user;
    
    if (user) {
        currentUser.username = user.username || '';
        currentUser.firstName = user.first_name || 'Пользователь';
        currentUser.photoUrl = user.photo_url || '';
        currentUser.isAdmin = currentUser.username === ADMIN_USERNAME;
        
        const userName = document.getElementById('userName');
        const userUsername = document.getElementById('userUsername');
        const userAvatar = document.getElementById('userAvatar');
        const userInfo = document.querySelector('.user-info');
        
        userName.textContent = currentUser.firstName;
        userUsername.textContent = currentUser.username ? '@' + currentUser.username : '';
        
        if (currentUser.photoUrl) {
            userAvatar.innerHTML = '<img src="' + currentUser.photoUrl + '" alt="' + currentUser.firstName + '">';
        } else {
            userAvatar.textContent = currentUser.firstName.charAt(0).toUpperCase();
        }
        
        if (currentUser.isAdmin) {
            const badge = document.createElement('div');
            badge.className = 'admin-badge';
            badge.textContent = 'Администратор';
            userInfo.appendChild(badge);
            
            document.getElementById('actionBar').style.display = 'flex';
            document.getElementById('settingsBtn').style.display = 'flex';
        }
    } else {
        currentUser.firstName = 'Тестовый пользователь';
        currentUser.username = '';
        document.getElementById('userName').textContent = currentUser.firstName;
    }
}

// Render categories navigation
function renderCategories() {
    const categoriesNav = document.getElementById('categoriesNav');
    categoriesNav.innerHTML = appData.categories.map(function(cat) {
        const activeClass = state.currentCategory === cat.id ? 'active' : '';
        return '<button class="category-btn ' + activeClass + '" data-category="' + cat.id + '"><span>' + cat.emoji + '</span><span>' + cat.name + '</span></button>';
    }).join('');
    
    categoriesNav.querySelectorAll('.category-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            state.currentCategory = btn.dataset.category;
            state.editMode = false;
            renderContent();
        });
    });
}

// Render content based on category type
function renderContent() {
    const category = appData.categories.find(function(cat) { return cat.id === state.currentCategory; });
    const linksSection = document.getElementById('linksSection');
    const chatSection = document.getElementById('chatSection');
    const addBtn = document.getElementById('addLinkBtn');
    const manageBtn = document.getElementById('manageBtn');
    
    if (category.type === 'chat') {
        linksSection.style.display = 'none';
        chatSection.style.display = 'flex';
        if (currentUser.isAdmin) {
            addBtn.style.display = 'none';
            manageBtn.innerHTML = '<span>🗑️</span><span>Очистить чат</span>';
        }
        renderChat();
    } else {
        linksSection.style.display = 'block';
        chatSection.style.display = 'none';
        if (currentUser.isAdmin) {
            addBtn.style.display = 'flex';
            const btnText = state.editMode ? 'Готово' : 'Редактировать';
            manageBtn.innerHTML = '<span>✏️</span><span id="manageBtnText">' + btnText + '</span>';
        }
        renderSectionHeader();
        renderLinks();
    }
    
    renderCategories();
}

// Render section header
function renderSectionHeader() {
    const sectionHeader = document.getElementById('sectionHeader');
    const category = appData.categories.find(function(cat) { return cat.id === state.currentCategory; });
    const links = getFilteredLinks();
    const linkText = links.length === 1 ? 'ссылка' : 'ссылок';
    
    sectionHeader.innerHTML = '<span class="section-icon">' + category.emoji + '</span><h2 class="section-title">' + category.name + '</h2><span class="section-count">' + links.length + ' ' + linkText + '</span>';
}

// Get filtered links
function getFilteredLinks() {
    return appData.links.filter(function(link) { return link.category === state.currentCategory; });
}

// Render links
function renderLinks() {
    const linksGrid = document.getElementById('linksGrid');
    const links = getFilteredLinks();
    
    if (links.length === 0) {
        linksGrid.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-text">В этой категории пока нет ссылок</div></div>';
        return;
    }
    
    linksGrid.innerHTML = links.map(function(link) {
        const actionsVisible = state.editMode && currentUser.isAdmin ? 'visible' : '';
        return '<div class="link-card" data-link-id="' + link.id + '"><div class="link-header"><div class="link-emoji">' + link.emoji + '</div><div class="link-info"><div class="link-title">' + link.title + '</div><div class="link-description">' + link.description + '</div><div class="link-url">' + link.url + '</div></div></div><div class="link-actions ' + actionsVisible + '"><button class="link-action-btn link-edit-btn" data-action="edit">✏️ Изменить</button><button class="link-action-btn link-delete-btn" data-action="delete">🗑️ Удалить</button></div></div>';
    }).join('');
    
    linksGrid.querySelectorAll('.link-card').forEach(function(card) {
        const linkId = parseInt(card.dataset.linkId);
        const link = appData.links.find(function(l) { return l.id === linkId; });
        
        card.addEventListener('click', function(e) {
            if (e.target.closest('.link-action-btn')) return;
            if (!state.editMode) {
                window.open(link.url, '_blank');
            }
        });
        
        const editBtn = card.querySelector('[data-action="edit"]');
        if (editBtn) {
            editBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                openEditModal(linkId);
            });
        }
        
        const deleteBtn = card.querySelector('[data-action="delete"]');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                deleteLink(linkId);
            });
        }
    });
}

// Render chat messages
function renderChat() {
    const chatMessages = document.getElementById('chatMessages');
    
    if (appData.messages.length === 0) {
        chatMessages.innerHTML = '<div class="empty-state"><div class="empty-icon">💬</div><div class="empty-text">Сообщений пока нет. Напишите первым!</div></div>';
        return;
    }
    
    chatMessages.innerHTML = appData.messages.map(function(msg) {
        const date = new Date(msg.timestamp);
        const timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const dateStr = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
        const avatarContent = msg.avatarUrl ? '<img src="' + msg.avatarUrl + '" alt="' + msg.displayName + '">' : (msg.displayName ? msg.displayName.charAt(0).toUpperCase() : '👤');
        const deleteBtn = (currentUser.isAdmin || msg.username === currentUser.username) ? '<button class="chat-delete-btn" data-msg-id="' + msg.id + '">Удалить</button>' : '';
        
        return '<div class="chat-message"><div class="chat-avatar">' + avatarContent + '</div><div class="chat-content"><div class="chat-header"><span class="chat-username">' + (msg.displayName || msg.username) + '</span><span class="chat-timestamp">' + dateStr + ' ' + timeStr + '</span>' + deleteBtn + '</div><div class="chat-text">' + escapeHtml(msg.message) + '</div></div></div>';
    }).join('');
    
    chatMessages.querySelectorAll('.chat-delete-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const msgId = parseInt(btn.dataset.msgId);
            deleteMessage(msgId);
        });
    });
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send chat message
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    const newMessage = {
        id: Date.now(),
        username: currentUser.username || 'guest',
        displayName: currentUser.firstName,
        avatarUrl: currentUser.photoUrl,
        message: message,
        timestamp: Date.now(),
        isAdmin: currentUser.isAdmin
    };
    
    appData.messages.push(newMessage);
    saveData();
    input.value = '';
    renderChat();
}

// Delete message
function deleteMessage(msgId) {
    if (confirm('Удалить это сообщение?')) {
        const index = appData.messages.findIndex(function(m) { return m.id === msgId; });
        if (index > -1) {
            appData.messages.splice(index, 1);
            saveData();
            renderChat();
        }
    }
}

// Clear all chat messages
function clearChat() {
    if (confirm('Удалить все сообщения в чате? Это действие нельзя отменить.')) {
        appData.messages = [];
        saveData();
        renderChat();
    }
}

// Toggle edit mode
function toggleEditMode() {
    if (!currentUser.isAdmin) return;
    
    const category = appData.categories.find(function(cat) { return cat.id === state.currentCategory; });
    
    if (category.type === 'chat') {
        clearChat();
    } else {
        state.editMode = !state.editMode;
        const manageBtnText = document.getElementById('manageBtnText');
        if (manageBtnText) {
            manageBtnText.textContent = state.editMode ? 'Готово' : 'Редактировать';
        }
        renderLinks();
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Open add link modal
function openAddModal() {
    if (!currentUser.isAdmin) return;
    
    state.editingLinkId = null;
    const modal = document.getElementById('linkModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('linkForm');
    
    modalTitle.textContent = 'Добавить ссылку';
    form.reset();
    
    const categorySelect = document.getElementById('linkCategory');
    categorySelect.innerHTML = appData.categories.filter(function(cat) { return cat.type === 'links'; }).map(function(cat) {
        const selected = cat.id === state.currentCategory ? 'selected' : '';
        return '<option value="' + cat.id + '" ' + selected + '>' + cat.emoji + ' ' + cat.name + '</option>';
    }).join('');
    
    modal.classList.add('active');
}

// Open edit link modal
function openEditModal(linkId) {
    if (!currentUser.isAdmin) return;
    
    state.editingLinkId = linkId;
    const link = appData.links.find(function(l) { return l.id === linkId; });
    if (!link) return;
    
    const modal = document.getElementById('linkModal');
    const modalTitle = document.getElementById('modalTitle');
    
    modalTitle.textContent = 'Редактировать ссылку';
    
    document.getElementById('linkTitle').value = link.title;
    document.getElementById('linkUrl').value = link.url;
    document.getElementById('linkEmoji').value = link.emoji;
    document.getElementById('linkDescription').value = link.description || '';
    
    const categorySelect = document.getElementById('linkCategory');
    categorySelect.innerHTML = appData.categories.filter(function(cat) { return cat.type === 'links'; }).map(function(cat) {
        const selected = cat.id === link.category ? 'selected' : '';
        return '<option value="' + cat.id + '" ' + selected + '>' + cat.emoji + ' ' + cat.name + '</option>';
    }).join('');
    
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
        const link = appData.links.find(function(l) { return l.id === state.editingLinkId; });
        if (link) {
            link.title = title;
            link.url = url;
            link.category = category;
            link.emoji = emoji;
            link.description = description;
        }
    } else {
        const newLink = {
            id: Date.now(),
            title: title,
            url: url,
            category: category,
            emoji: emoji,
            description: description
        };
        appData.links.push(newLink);
    }
    
    saveData();
    closeModal();
    renderContent();
}

// Delete link
function deleteLink(linkId) {
    if (!currentUser.isAdmin) return;
    
    if (confirm('Вы уверены, что хотите удалить эту ссылку?')) {
        const index = appData.links.findIndex(function(l) { return l.id === linkId; });
        if (index > -1) {
            appData.links.splice(index, 1);
            saveData();
            renderContent();
        }
    }
}

// Export data
function exportData() {
    if (!currentUser.isAdmin) return;
    
    const dataStr = JSON.stringify(appData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'edm_data_' + Date.now() + '.json';
    link.click();
    URL.revokeObjectURL(url);
    
    alert('Данные экспортированы!\n\nИнтеграция с Google Sheets:\n1. Создайте Google Таблицу\n2. Apps Script -> doPost(e)\n3. Добавьте URL в код');
}

// Initialize app
function init() {
    initTelegramUser();
    renderContent();
    
    document.getElementById('addLinkBtn').addEventListener('click', openAddModal);
    document.getElementById('manageBtn').addEventListener('click', toggleEditMode);
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('linkForm').addEventListener('submit', saveLink);
    
    document.getElementById('chatSendBtn').addEventListener('click', sendMessage);
    document.getElementById('chatInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    document.getElementById('helpBtn').addEventListener('click', function() {
        alert('EDM Resources\n\nЭто приложение для управления ресурсами по электроэрозионной обработке.\n\n📚 Просматривайте ссылки на платы и схемы\n💬 Общайтесь в чате\n\nАдминистратор может:\n• Добавлять и редактировать ссылки\n• Управлять чатом\n• Экспортировать данные');
    });
    
    document.getElementById('settingsBtn').addEventListener('click', function() {
        if (confirm('Сбросить все данные и вернуть начальные настройки?')) {
            appData = JSON.parse(JSON.stringify(defaultData));
            saveData();
            renderContent();
            alert('Данные сброшены!');
        }
    });
    
    document.getElementById('backBtn').addEventListener('click', function() {
        if (tg.close) {
            tg.close();
        } else {
            window.history.back();
        }
    });
    
    document.getElementById('linkModal').addEventListener('click', function(e) {
        if (e.target.id === 'linkModal') {
            closeModal();
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}