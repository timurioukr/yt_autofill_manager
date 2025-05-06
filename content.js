chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fill') {
        const currentUrl = window.location.origin;
        
        chrome.storage.local.get(['slots'], (result) => {
            const slots = result.slots || [];
            const slot = slots.find(s => s.url === currentUrl);
            
            if (slot) {
                slot.fields.forEach(field => {
                    const element = document.getElementById(field.id);
                    if (element) {
                        element.value = field.value;
                        // Викликаємо подію input для активації валідації та інших обробників
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                        element.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
            }
        });
    }
}); 