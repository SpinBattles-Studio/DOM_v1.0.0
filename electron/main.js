const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let dataPath;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    title: 'Decision Optimization Management',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
    },
    frame: true,
    backgroundColor: '#1e293b'
  });

  // Allow external API calls
  mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
    callback({ requestHeaders: details.requestHeaders });
  });

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Access-Control-Allow-Origin': ['*'],
        'Access-Control-Allow-Headers': ['*']
      }
    });
  });

  // Force production mode for packaged app
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    const indexPath = path.join(app.getAppPath(), 'dist', 'index.html');
    mainWindow.loadFile(indexPath);
  }
}

function initStorage() {
  dataPath = path.join(app.getPath('userData'), 'data.json');
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify({ decisions: [], settings: {} }));
  }
}

function readData() {
  try {
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { decisions: [], settings: {} };
  }
}

function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

app.whenReady().then(() => {
  initStorage();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('save-decision', async (event, decision) => {
  const data = readData();
  const newDecision = {
    id: Date.now(),
    title: decision.title,
    description: decision.description,
    questions: decision.questions,
    answers: decision.answers,
    results: decision.results,
    best_option: decision.bestOption,
    status: decision.status || 'completed',
    chart_data: decision.chartData || [],
    timeline: decision.timeline || [],
    metrics: decision.metrics || [],
    options: decision.options || [],
    deep_analysis: decision.deepAnalysis || null,
    created_at: new Date().toISOString()
  };
  data.decisions.unshift(newDecision);
  writeData(data);
  return { id: newDecision.id };
});

ipcMain.handle('get-decisions', async () => {
  const data = readData();
  return data.decisions;
});

ipcMain.handle('get-decision', async (event, id) => {
  const data = readData();
  return data.decisions.find(d => d.id == id);
});

ipcMain.handle('delete-decision', async (event, id) => {
  const data = readData();
  data.decisions = data.decisions.filter(d => d.id != id);
  writeData(data);
  return { success: true };
});

ipcMain.handle('save-setting', async (event, key, value) => {
  const data = readData();
  data.settings[key] = value;
  writeData(data);
  return { success: true };
});

ipcMain.handle('get-setting', async (event, key) => {
  const data = readData();
  return data.settings[key] || null;
});

ipcMain.handle('ai-request', async (event, payload) => {
  const https = require('https');
  const url = new URL(payload.url);
  
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload.body);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': payload.headers.Authorization,
        'Content-Length': Buffer.byteLength(body),
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, data: { error: { message: data } } });
        }
      });
    });

    req.on('error', (err) => reject(err.message));
    req.write(body);
    req.end();
  });
});
