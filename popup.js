document.addEventListener('DOMContentLoaded', () => {
    const mainMenu = document.getElementById('main-menu');
    const slotsMenu = document.getElementById('slots-menu');
    const editForm = document.getElementById('edit-form');
    const fillBtn = document.getElementById('fill-btn');
    const editBtn = document.getElementById('edit-btn');
    const slotsBtn = document.getElementById('slots-btn');
    const addSlotBtn = document.getElementById('add-slot-btn');
    const saveBtn = document.getElementById('save-btn');
    const addFieldBtn = document.getElementById('add-field-btn');
    const alert = document.getElementById('alert');

    let currentUrl = '';
    let currentSlot = null;

    // Отримання поточного URL
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        currentUrl = new URL(tabs[0].url).origin;
        checkForExistingData();
    });

    // Перевірка наявності даних для поточного сайту
    function checkForExistingData() {
        chrome.storage.local.get(['slots'], (result) => {
            const slots = result.slots || [];
            const hasData = slots.some(slot => slot.url === currentUrl);
            editBtn.style.display = hasData ? 'block' : 'none';
        });
    }

    // Додавання нового поля
    function addField(container, field = { id: '', value: '' }) {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'input-group';
        fieldDiv.innerHTML = `
            <input type="text" class="field-id" placeholder="ID поля" value="${field.id}">
            <input type="text" class="field-value" placeholder="Значення" value="${field.value}">
            <span class="delete-btn">✖</span>
        `;
        container.appendChild(fieldDiv);

        fieldDiv.querySelector('.delete-btn').addEventListener('click', () => {
            fieldDiv.remove();
        });
    }

    // Збереження даних
    function saveData() {
        const url = document.getElementById('site-url').value;
        const fields = Array.from(document.querySelectorAll('.input-group')).map(group => ({
            id: group.querySelector('.field-id').value,
            value: group.querySelector('.field-value').value
        }));

        chrome.storage.local.get(['slots'], (result) => {
            const slots = result.slots || [];
            const existingIndex = slots.findIndex(slot => slot.url === url);

            if (existingIndex !== -1) {
                slots[existingIndex] = { url, fields };
            } else {
                slots.push({ url, fields });
            }

            chrome.storage.local.set({ slots }, () => {
                showMainMenu();
                checkForExistingData();
            });
        });
    }

    // Показ головного меню
    function showMainMenu() {
        mainMenu.style.display = 'block';
        slotsMenu.style.display = 'none';
        editForm.style.display = 'none';
    }

    // Показ меню слотів
    function showSlotsMenu() {
        mainMenu.style.display = 'none';
        slotsMenu.style.display = 'block';
        editForm.style.display = 'none';
        loadSlots();
    }

    // Показ форми редагування
    function showEditForm(slot = null) {
        mainMenu.style.display = 'none';
        slotsMenu.style.display = 'none';
        editForm.style.display = 'block';

        const fieldsContainer = document.getElementById('fields-container');
        fieldsContainer.innerHTML = '';
        document.getElementById('site-url').value = slot ? slot.url : currentUrl;

        if (slot) {
            slot.fields.forEach(field => addField(fieldsContainer, field));
        } else {
            addField(fieldsContainer);
        }
    }

    // Завантаження слотів
    function loadSlots() {
        const slotsList = document.getElementById('slots-list');
        slotsList.innerHTML = '';

        chrome.storage.local.get(['slots'], (result) => {
            const slots = result.slots || [];
            slots.forEach(slot => {
                const slotDiv = document.createElement('div');
                slotDiv.className = 'slot-item';
                slotDiv.innerHTML = `
                    <span>${slot.url}</span>
                    <span class="delete-btn">✖</span>
                `;
                slotsList.appendChild(slotDiv);

                slotDiv.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('delete-btn')) {
                        showEditForm(slot);
                    }
                });

                slotDiv.querySelector('.delete-btn').addEventListener('click', () => {
                    const newSlots = slots.filter(s => s.url !== slot.url);
                    chrome.storage.local.set({ slots: newSlots }, loadSlots);
                });
            });
        });
    }

    // Обробники подій
    fillBtn.addEventListener('click', () => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'fill' });
        });
    });

    editBtn.addEventListener('click', () => {
        chrome.storage.local.get(['slots'], (result) => {
            const slots = result.slots || [];
            const slot = slots.find(s => s.url === currentUrl);
            if (slot) {
                showEditForm(slot);
            }
        });
    });

    slotsBtn.addEventListener('click', showSlotsMenu);
    addSlotBtn.addEventListener('click', () => showEditForm());
    saveBtn.addEventListener('click', saveData);
    addFieldBtn.addEventListener('click', () => {
        addField(document.getElementById('fields-container'));
    });
}); 