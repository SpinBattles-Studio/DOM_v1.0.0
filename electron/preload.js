const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveDecision: (decision) => ipcRenderer.invoke('save-decision', decision),
  getDecisions: () => ipcRenderer.invoke('get-decisions'),
  getDecision: (id) => ipcRenderer.invoke('get-decision', id),
  deleteDecision: (id) => ipcRenderer.invoke('delete-decision', id),
  saveSetting: (key, value) => ipcRenderer.invoke('save-setting', key, value),
  getSetting: (key) => ipcRenderer.invoke('get-setting', key),
  aiRequest: (payload) => ipcRenderer.invoke('ai-request', payload)
});
