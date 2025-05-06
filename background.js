// Ініціалізація сховища при встановленні розширення
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['slots'], (result) => {
        if (!result.slots) {
            chrome.storage.local.set({ slots: [] });
        }
    });
}); 