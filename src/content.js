chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fillData") {
    fillData(message.slot);
    sendResponse({ status: "ok" });
  }
});

function fillData(slot) {
  if (!slot || !slot.fields) return;
  slot.fields.forEach((field) => {
    const input = document.getElementById(field.fieldId);
    if (input) {
      input.value = field.fieldValue;

      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
}
