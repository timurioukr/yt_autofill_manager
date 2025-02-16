import { loadSlots, saveSlots } from "./storage.js";

let slots = loadSlots();

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("fill-data-btn").addEventListener("click", fillData);
  document
    .getElementById("manage-slots-btn")
    .addEventListener("click", toggleSlotManagement);

  document.getElementById("add-slot-btn").addEventListener("click", () => {
    addNewSlot();
    renderSlotList();
  });

  renderSlotList();
});

async function fillData() {
  const currentSlot = await getCurrentSlot();
  if (!currentSlot) {
    alert("No slot found for this website.");
    return;
  }
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "fillData",
      slot: currentSlot,
    });
  });
}

async function getCurrentSlot() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        const url = tabs[0].url;
        const matchedSlot = slots.find(
          (slot) => slot.url && url.includes(slot.url)
        );
        resolve(matchedSlot);
      } else {
        resolve(null);
      }
    });
  });
}

function toggleSlotManagement() {
  const slotManagementDiv = document.getElementById("slot-management");
  slotManagementDiv.style.display =
    slotManagementDiv.style.display === "none" ? "block" : "none";
  renderSlotList();
}

function renderSlotList() {
  const slotList = document.getElementById("slot-list");
  slotList.innerHTML = "";
  slots = loadSlots();

  slots.forEach((slot, index) => {
    const slotItem = document.createElement("div");
    slotItem.className = "slot-item";
    slot.name = slot.name || `Slot ${index + 1}`;
    slotItem.innerText = slot.name;
    slotItem.style.cursor = "pointer";
    slotItem.style.padding = "5px";
    slotItem.style.border = "1px solid #ddd";
    slotItem.style.marginBottom = "5px";

    slotItem.addEventListener("click", () => {
      renderSlotEditor(index);
    });

    slotItem.addEventListener("dblclick", () => {
      const input = document.createElement("input");
      input.type = "text";
      input.value = slot.name;
      input.style.width = "100%";
      slotItem.innerHTML = "";
      slotItem.appendChild(input);
      input.focus();
      input.addEventListener("blur", () => {
        slot.name = input.value.trim() || `Slot ${index + 1}`;
        saveSlotAt(index, slot);
        renderSlotList();
      });
    });

    slotList.appendChild(slotItem);
  });
}

function saveSlotAt(index, slot) {
  slots[index] = slot;
  saveSlots(slots);
}

function addNewSlot() {
  const newSlot = { name: `Slot ${slots.length + 1}`, url: "", fields: [] };
  slots.push(newSlot);
  saveSlots(slots);
}

function renderSlotEditor(slotIndex) {
  let editorDiv = document.getElementById("slot-editor");
  if (!editorDiv) {
    editorDiv = document.createElement("div");
    editorDiv.id = "slot-editor";
    editorDiv.style.border = "1px solid #aaa";
    editorDiv.style.padding = "10px";
    editorDiv.style.marginTop = "10px";
    document.getElementById("slot-management").appendChild(editorDiv);
  }
  editorDiv.innerHTML = "";

  const slot = slots[slotIndex];

  const urlLabel = document.createElement("label");
  urlLabel.innerText = "Website (URL part):";
  const urlInput = document.createElement("input");
  urlInput.type = "text";
  urlInput.className = "slot-url";
  urlInput.value = slot.url || "";
  urlInput.style.width = "100%";
  urlInput.style.marginBottom = "10px";

  editorDiv.appendChild(urlLabel);
  editorDiv.appendChild(urlInput);

  const fieldsDiv = document.createElement("div");
  fieldsDiv.className = "fields";

  if (slot.fields && Array.isArray(slot.fields)) {
    slot.fields.forEach((field, fieldIndex) => {
      const fieldDiv = document.createElement("div");
      fieldDiv.className = "field";
      fieldDiv.style.display = "flex";
      fieldDiv.style.marginBottom = "5px";

      const fieldIdInput = document.createElement("input");
      fieldIdInput.type = "text";
      fieldIdInput.className = "field-id";
      fieldIdInput.placeholder = "Input ID";
      fieldIdInput.value = field.fieldId || "";

      const fieldValueInput = document.createElement("input");
      fieldValueInput.type = "text";
      fieldValueInput.className = "field-value";
      fieldValueInput.placeholder = "Value";
      fieldValueInput.value = field.fieldValue || "";

      fieldDiv.appendChild(fieldIdInput);
      fieldDiv.appendChild(fieldValueInput);
      fieldsDiv.appendChild(fieldDiv);
    });
  }

  editorDiv.appendChild(fieldsDiv);

  const addFieldBtn = document.createElement("button");
  addFieldBtn.innerText = "Add Field";
  addFieldBtn.addEventListener("click", () => {
    const fieldDiv = document.createElement("div");
    fieldDiv.className = "field";
    fieldDiv.style.display = "flex";
    fieldDiv.style.marginBottom = "5px";

    const fieldIdInput = document.createElement("input");
    fieldIdInput.type = "text";
    fieldIdInput.className = "field-id";
    fieldIdInput.placeholder = "Input ID";

    const fieldValueInput = document.createElement("input");
    fieldValueInput.type = "text";
    fieldValueInput.className = "field-value";
    fieldValueInput.placeholder = "Value";

    fieldDiv.appendChild(fieldIdInput);
    fieldDiv.appendChild(fieldValueInput);
    fieldsDiv.appendChild(fieldDiv);
  });
  editorDiv.appendChild(addFieldBtn);

  const saveSlotBtn = document.createElement("button");
  saveSlotBtn.innerText = "Save Slot";
  saveSlotBtn.style.display = "block";
  saveSlotBtn.style.marginTop = "10px";
  saveSlotBtn.addEventListener("click", () => {
    slot.url = urlInput.value.trim();
    const newFields = [];
    const fieldDivs = fieldsDiv.querySelectorAll(".field");
    fieldDivs.forEach((fieldDiv) => {
      const fieldId = fieldDiv.querySelector(".field-id").value.trim();
      const fieldValue = fieldDiv.querySelector(".field-value").value.trim();
      if (fieldId) {
        newFields.push({ fieldId, fieldValue });
      }
    });
    slot.fields = newFields;
    saveSlotAt(slotIndex, slot);
    alert("Slot saved!");
    renderSlotList();
  });
  editorDiv.appendChild(saveSlotBtn);

  const deleteSlotBtn = document.createElement("button");
  deleteSlotBtn.innerText = "Delete Slot";
  deleteSlotBtn.style.display = "block";
  deleteSlotBtn.style.marginTop = "5px";
  deleteSlotBtn.addEventListener("click", () => {
    slots.splice(slotIndex, 1);
    saveSlots(slots);
    renderSlotList();
    editorDiv.innerHTML = "";
  });
  editorDiv.appendChild(deleteSlotBtn);
}
