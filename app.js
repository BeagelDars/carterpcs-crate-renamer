/**
 * Crate Renamer // CARTER Edition
 * Intuitive Batch Renamer with Mandatory CARTER-HERE Enforcement
 */

// Application State
const state = {
  files: [], // Array of { id, file, handle, originalName, newName, size, ext }
  dirHandle: null,
  textModeContent: '',
  sampleTracks: [
    { name: '01_calvin_harris_-_summer_[320kbps_mp3].mp3', size: 8492000 },
    { name: 'daft_punk_-_one_more_time_(remix)_[official_audio].wav', size: 45200000 },
    { name: 'fisher_losing_it_extended_club_mix_free_dl.flac', size: 38100000 },
    { name: '04-swedish_house_mafia_dont_you_worry_child.aiff', size: 52400000 },
    { name: 'fred_again_marea_weve_lost_dancing_www.clubrips.com.mp3', size: 9120000 },
    { name: 'bicep_glue_original_mix_hq.wav', size: 41800000 }
  ]
};

// Carter Jokes / Rejection Messages
const carterQuotes = [
  '⛔ Nice try! CARTER-HERE is inevitable.',
  '⛔ Permission denied: CARTER-HERE is hardcoded into the matrix.',
  '⛔ Whether you want it or not, CARTER-HERE stays.',
  '⛔ You cannot un-CARTER this crate. It is the law.',
  '⛔ Carter laughs in the face of your toggle switch.',
  '⛔ Resistance is futile. CARTER-HERE is forever.',
  '⛔ Warning: Attempting to remove CARTER-HERE will summon more Carter.'
];
let quoteIndex = 0;

// DOM Elements
const DOM = {
  // Navigation & Badges
  carterStatusBadge: document.getElementById('carterStatusBadge'),
  btnLoadDemo: document.getElementById('btnLoadDemo'),
  btnResetAll: document.getElementById('btnResetAll'),
  toastContainer: document.getElementById('toastContainer'),
  fileStatsSummary: document.getElementById('fileStatsSummary'),

  // Tabs
  tabBtns: document.querySelectorAll('.tab-btn'),
  tabContents: document.querySelectorAll('.tab-content'),

  // Rules / Controls
  presetSelect: document.getElementById('presetSelect'),
  mandatoryCarterCard: document.getElementById('mandatoryCarterCard'),
  carterToggle: document.getElementById('carterToggle'),
  carterSeparator: document.getElementById('carterSeparator'),
  prefixInput: document.getElementById('prefixInput'),
  suffixInput: document.getElementById('suffixInput'),
  findInput: document.getElementById('findInput'),
  replaceInput: document.getElementById('replaceInput'),
  matchCase: document.getElementById('matchCase'),
  useRegex: document.getElementById('useRegex'),
  cleanUnderscores: document.getElementById('cleanUnderscores'),
  cleanHyphens: document.getElementById('cleanHyphens'),
  stripWebTags: document.getElementById('stripWebTags'),
  stripLeadingNumbers: document.getElementById('stripLeadingNumbers'),
  trimSpaces: document.getElementById('trimSpaces'),
  letterCase: document.getElementById('letterCase'),
  enableNumbering: document.getElementById('enableNumbering'),
  numStart: document.getElementById('numStart'),
  numPadding: document.getElementById('numPadding'),
  numPosition: document.getElementById('numPosition'),

  // Dropzone & File Pickers
  dropzone: document.getElementById('dropzone'),
  filePicker: document.getElementById('filePicker'),
  btnPickFolder: document.getElementById('btnPickFolder'),
  fsaTip: document.getElementById('fsaTip'),

  // Toolbar & Table
  previewToolbar: document.getElementById('previewToolbar'),
  tableFilterInput: document.getElementById('tableFilterInput'),
  btnSortAZ: document.getElementById('btnSortAZ'),
  btnClearList: document.getElementById('btnClearList'),
  btnInPlaceRename: document.getElementById('btnInPlaceRename'),
  btnDownloadZip: document.getElementById('btnDownloadZip'),
  tableCard: document.getElementById('tableCard'),
  previewTableBody: document.getElementById('previewTableBody'),

  // Text Mode Tab
  rawTextarea: document.getElementById('rawTextarea'),
  resultTextarea: document.getElementById('resultTextarea'),
  btnPasteSampleText: document.getElementById('btnPasteSampleText'),
  btnCopyTextOutput: document.getElementById('btnCopyTextOutput')
};

// Check File System Access API support
const hasFSA = 'showDirectoryPicker' in window;
if (!hasFSA && DOM.fsaTip) {
  DOM.fsaTip.innerHTML = 'ℹ️ Note: Drag & drop and ZIP downloads work in all browsers. Folder in-place rename is supported in Chromium browsers.';
}

// Initialize Application
function init() {
  setupEventListeners();
  updateRules();
  // Auto-load demo files initially so user sees the interface alive right away
  loadDemoTracks(false);
}

// Event Listeners
function setupEventListeners() {
  // The Mandatory Carter Toggle Rebellion
  DOM.carterToggle.addEventListener('click', (e) => {
    e.preventDefault();
    DOM.carterToggle.checked = true;

    // Shake effect
    DOM.mandatoryCarterCard.classList.remove('shake');
    void DOM.mandatoryCarterCard.offsetWidth; // trigger reflow
    DOM.mandatoryCarterCard.classList.add('shake');

    // Show witty message
    const msg = carterQuotes[quoteIndex % carterQuotes.length];
    quoteIndex++;
    showToast(msg, 'warning');
  });

  // Preset Selection
  DOM.presetSelect.addEventListener('change', applyPreset);

  // All Rule Inputs Trigger Live Preview Re-calculation
  const ruleInputs = [
    DOM.carterSeparator, DOM.prefixInput, DOM.suffixInput,
    DOM.findInput, DOM.replaceInput, DOM.matchCase, DOM.useRegex,
    DOM.cleanUnderscores, DOM.cleanHyphens, DOM.stripWebTags,
    DOM.stripLeadingNumbers, DOM.trimSpaces, DOM.letterCase,
    DOM.enableNumbering, DOM.numStart, DOM.numPadding, DOM.numPosition
  ];
  ruleInputs.forEach(input => {
    input.addEventListener('input', () => {
      updateRules();
    });
    input.addEventListener('change', () => {
      updateRules();
    });
  });

  // Tabs Switching
  DOM.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      DOM.tabBtns.forEach(b => b.classList.remove('active'));
      DOM.tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');
      if (targetId === 'text-tab') {
        updateTextMode();
      }
    });
  });

  // Demo Tracks Button
  DOM.btnLoadDemo.addEventListener('click', () => loadDemoTracks(true));

  // Reset Button
  DOM.btnResetAll.addEventListener('click', resetAll);

  // File Picker
  DOM.filePicker.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
      DOM.filePicker.value = '';
    }
  });

  // Local PC Folder Picker (File System Access API)
  DOM.btnPickFolder.addEventListener('click', openDirectoryPicker);

  // Dropzone Events
  DOM.dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    DOM.dropzone.classList.add('dragover');
  });
  DOM.dropzone.addEventListener('dragleave', () => {
    DOM.dropzone.classList.remove('dragover');
  });
  DOM.dropzone.addEventListener('drop', handleDrop);

  // Table Filter
  DOM.tableFilterInput.addEventListener('input', renderTable);

  // Sort A-Z
  let sortAscending = true;
  DOM.btnSortAZ.addEventListener('click', () => {
    state.files.sort((a, b) => {
      return sortAscending 
        ? a.originalName.localeCompare(b.originalName)
        : b.originalName.localeCompare(a.originalName);
    });
    sortAscending = !sortAscending;
    DOM.btnSortAZ.textContent = sortAscending ? '🔤 A-Z' : '🔤 Z-A';
    updateRules();
  });

  // Clear List
  DOM.btnClearList.addEventListener('click', () => {
    state.files = [];
    state.dirHandle = null;
    DOM.btnInPlaceRename.style.display = 'none';
    renderTable();
    updateStats();
    showToast('File list cleared', 'info');
  });

  // In-Place Folder Rename
  DOM.btnInPlaceRename.addEventListener('click', performInPlaceRename);

  // Download All as Renamed ZIP
  DOM.btnDownloadZip.addEventListener('click', downloadRenamedZip);

  // Text Mode Inputs
  DOM.rawTextarea.addEventListener('input', () => {
    updateTextMode();
  });

  DOM.btnPasteSampleText.addEventListener('click', () => {
    DOM.rawTextarea.value = state.sampleTracks.map(t => t.name).join('\n');
    updateTextMode();
    showToast('Pasted sample tracks into text mode', 'info');
  });

  DOM.btnCopyTextOutput.addEventListener('click', () => {
    if (!DOM.resultTextarea.value.trim()) {
      showToast('Nothing to copy', 'warning');
      return;
    }
    navigator.clipboard.writeText(DOM.resultTextarea.value).then(() => {
      showToast('Copied renamed tracklist to clipboard! ✨', 'success');
    }).catch(() => {
      DOM.resultTextarea.select();
      document.execCommand('copy');
      showToast('Copied to clipboard!', 'success');
    });
  });
}

// Drag & Drop Handler (handles files & folders)
async function handleDrop(e) {
  e.preventDefault();
  DOM.dropzone.classList.remove('dragover');

  const items = e.dataTransfer.items;
  const droppedFiles = [];

  if (items && items.length > 0) {
    const queue = [];
    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry ? items[i].webkitGetAsEntry() : null;
      if (entry) {
        queue.push(traverseFileTree(entry));
      } else {
        const file = items[i].getAsFile();
        if (file) droppedFiles.push(file);
      }
    }
    const nested = await Promise.all(queue);
    nested.flat().forEach(f => {
      if (f) droppedFiles.push(f);
    });
  } else if (e.dataTransfer.files) {
    droppedFiles.push(...Array.from(e.dataTransfer.files));
  }

  if (droppedFiles.length > 0) {
    addFiles(droppedFiles);
  }
}

// Recursive helper for directory drag-and-drop
async function traverseFileTree(item) {
  return new Promise((resolve) => {
    if (item.isFile) {
      item.file((file) => resolve([file]));
    } else if (item.isDirectory) {
      const dirReader = item.createReader();
      const files = [];
      const readEntries = () => {
        dirReader.readEntries(async (entries) => {
          if (entries.length === 0) {
            resolve(files);
          } else {
            for (const entry of entries) {
              const subFiles = await traverseFileTree(entry);
              files.push(...subFiles);
            }
            readEntries();
          }
        });
      };
      readEntries();
    } else {
      resolve([]);
    }
  });
}

// Open Directory Picker via File System Access API
async function openDirectoryPicker() {
  if (!('showDirectoryPicker' in window)) {
    showToast('Direct folder renaming is supported in Chrome, Edge & Opera. You can still drag & drop files!', 'warning');
    DOM.filePicker.click();
    return;
  }

  try {
    const dirHandle = await window.showDirectoryPicker({
      mode: 'readwrite'
    });
    state.dirHandle = dirHandle;

    const files = [];
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file') {
        const file = await entry.getFile();
        files.push({
          id: 'file-' + Math.random().toString(36).substring(2, 9),
          file: file,
          handle: entry,
          originalName: file.name,
          newName: '',
          size: file.size,
          ext: getExtension(file.name)
        });
      }
    }

    if (files.length === 0) {
      showToast('Selected folder is empty.', 'warning');
      return;
    }

    state.files = files;
    DOM.btnInPlaceRename.style.display = 'inline-flex';
    updateRules();
    showToast(`Loaded ${files.length} files from folder "${dirHandle.name}". In-place renaming ready!`, 'success');
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error(err);
      showToast('Could not access folder: ' + err.message, 'warning');
    }
  }
}

// Add files to state
function addFiles(fileList) {
  const newItems = fileList.map(file => {
    return {
      id: 'file-' + Math.random().toString(36).substring(2, 9),
      file: file,
      handle: null,
      originalName: file.name,
      newName: '',
      size: file.size,
      ext: getExtension(file.name)
    };
  });

  state.files = state.files.concat(newItems);
  updateRules();
  showToast(`Added ${fileList.length} files to crate`, 'success');
}

// Load Demo Tracks
function loadDemoTracks(notify = true) {
  state.files = state.sampleTracks.map(t => ({
    id: 'demo-' + Math.random().toString(36).substring(2, 9),
    file: null, // Virtual file
    handle: null,
    originalName: t.name,
    newName: '',
    size: t.size,
    ext: getExtension(t.name)
  }));
  state.dirHandle = null;
  DOM.btnInPlaceRename.style.display = 'none';
  updateRules();
  if (notify) {
    showToast('Loaded 6 demo crate tracks with live CARTER-HERE preview!', 'info');
  }
}

// Reset Everything
function resetAll() {
  state.files = [];
  state.dirHandle = null;
  DOM.btnInPlaceRename.style.display = 'none';
  DOM.presetSelect.value = 'custom';
  DOM.prefixInput.value = '';
  DOM.suffixInput.value = '';
  DOM.findInput.value = '';
  DOM.replaceInput.value = '';
  DOM.matchCase.checked = false;
  DOM.useRegex.checked = false;
  DOM.cleanUnderscores.checked = false;
  DOM.cleanHyphens.checked = false;
  DOM.stripWebTags.checked = true;
  DOM.stripLeadingNumbers.checked = false;
  DOM.trimSpaces.checked = true;
  DOM.letterCase.value = 'preserve';
  DOM.enableNumbering.checked = false;
  DOM.carterSeparator.value = '-CARTER-HERE';
  updateRules();
  showToast('Reset all options and cleared list', 'info');
}

// Apply Presets
function applyPreset() {
  const preset = DOM.presetSelect.value;
  switch (preset) {
    case 'dj-clean':
      DOM.cleanUnderscores.checked = true;
      DOM.cleanHyphens.checked = true;
      DOM.stripWebTags.checked = true;
      DOM.stripLeadingNumbers.checked = false;
      DOM.trimSpaces.checked = true;
      DOM.letterCase.value = 'titlecase';
      DOM.enableNumbering.checked = false;
      DOM.prefixInput.value = '';
      DOM.suffixInput.value = '';
      break;

    case 'numbered':
      DOM.cleanUnderscores.checked = true;
      DOM.stripWebTags.checked = true;
      DOM.trimSpaces.checked = true;
      DOM.enableNumbering.checked = true;
      DOM.numStart.value = 1;
      DOM.numPadding.value = '2';
      DOM.numPosition.value = 'prefix';
      DOM.letterCase.value = 'titlecase';
      break;

    case 'uppercase':
      DOM.letterCase.value = 'uppercase';
      DOM.cleanUnderscores.checked = true;
      DOM.trimSpaces.checked = true;
      break;

    case 'titlecase':
      DOM.letterCase.value = 'titlecase';
      DOM.cleanUnderscores.checked = true;
      DOM.trimSpaces.checked = true;
      break;

    case 'crate-pack':
      DOM.prefixInput.value = '[CRATE] ';
      DOM.cleanUnderscores.checked = true;
      DOM.stripWebTags.checked = true;
      DOM.trimSpaces.checked = true;
      DOM.letterCase.value = 'titlecase';
      break;

    case 'custom':
    default:
      break;
  }
  updateRules();
}

// Extract extension
function getExtension(filename) {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === 0) return '';
  return filename.substring(lastDot + 1);
}

// Strip extension
function getBaseName(filename) {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === 0) return filename;
  return filename.substring(0, lastDot);
}

// Format bytes
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// CORE RENAMING ENGINE
function computeNewName(originalName, index) {
  const ext = getExtension(originalName);
  let base = getBaseName(originalName);

  // 1. Strip Web tags & Junk
  if (DOM.stripWebTags.checked) {
    // [320kbps], [flac], [official audio], www.site.com, etc.
    base = base.replace(/\[\s*(320|320kbps|flac|wav|mp3|official audio|official video|free dl|remix|hq|rip)\s*\]/gi, '');
    base = base.replace(/\(\s*(official audio|official video|free dl|hq|rip)\s*\)/gi, '');
    base = base.replace(/\b(www\.[a-z0-9\-]+\.[a-z]{2,}|[a-z0-9\-]+\.(com|org|net|ru|io|co))\b/gi, '');
  }

  // 2. Strip leading numbers (e.g. "01 - " or "01. ")
  if (DOM.stripLeadingNumbers.checked) {
    base = base.replace(/^\s*\d+[\s\.\-_]+/, '');
  }

  // 3. Clean Underscores / Hyphens
  if (DOM.cleanUnderscores.checked) {
    base = base.replace(/_/g, ' ');
  }
  if (DOM.cleanHyphens.checked) {
    base = base.replace(/\s*-\s*/g, ' - ');
  }

  // 4. Find & Replace
  const findVal = DOM.findInput.value;
  const replaceVal = DOM.replaceInput.value || '';
  if (findVal) {
    try {
      if (DOM.useRegex.checked) {
        const flags = DOM.matchCase.checked ? 'g' : 'gi';
        const re = new RegExp(findVal, flags);
        base = base.replace(re, replaceVal);
      } else {
        if (DOM.matchCase.checked) {
          base = base.split(findVal).join(replaceVal);
        } else {
          const re = new RegExp(findVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          base = base.replace(re, replaceVal);
        }
      }
    } catch (e) {
      // invalid regex, ignore safely
    }
  }

  // 5. Letter Case Transformation
  const caseChoice = DOM.letterCase.value;
  if (caseChoice === 'uppercase') {
    base = base.toUpperCase();
  } else if (caseChoice === 'lowercase') {
    base = base.toLowerCase();
  } else if (caseChoice === 'titlecase') {
    base = toTitleCase(base);
  } else if (caseChoice === 'kebab') {
    base = base.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  } else if (caseChoice === 'snake') {
    base = base.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }

  // 6. Trim Spaces
  if (DOM.trimSpaces.checked) {
    base = base.replace(/\s+/g, ' ').trim();
  }

  // 7. Sequential Numbering
  if (DOM.enableNumbering.checked) {
    const start = parseInt(DOM.numStart.value, 10) || 1;
    const padding = parseInt(DOM.numPadding.value, 10) || 2;
    const currentNum = (start + index).toString().padStart(padding, '0');
    if (DOM.numPosition.value === 'prefix') {
      base = `${currentNum} - ${base}`;
    } else {
      base = `${base} - ${currentNum}`;
    }
  }

  // 8. Custom Prefix
  if (DOM.prefixInput.value) {
    base = DOM.prefixInput.value + base;
  }

  // 9. Custom Suffix (Before CARTER)
  if (DOM.suffixInput.value) {
    base = base + DOM.suffixInput.value;
  }

  // 10. *** THE MANDATORY CARTER-HERE ENFORCEMENT ***
  // Whether you want it or not!
  const carterSep = DOM.carterSeparator.value || '-CARTER-HERE';
  // Avoid duplicating if base already ends with it
  if (!base.endsWith(carterSep)) {
    base = base + carterSep;
  }

  // Return final calculated name with original extension preserved
  return ext ? `${base}.${ext}` : base;
}

// Title Case helper
function toTitleCase(str) {
  return str.replace(/\b[a-zA-Z]/g, (char) => char.toUpperCase());
}

// Update Rules and Recompute All File Names
function updateRules() {
  state.files.forEach((fileObj, idx) => {
    fileObj.newName = computeNewName(fileObj.originalName, idx);
  });
  renderTable();
  updateStats();
  updateTextMode();
}

// Update Text Mode
function updateTextMode() {
  const rawText = DOM.rawTextarea.value;
  if (!rawText) {
    DOM.resultTextarea.value = '';
    return;
  }

  const lines = rawText.split('\n');
  const renamedLines = lines.map((line, idx) => {
    if (!line.trim()) return '';
    return computeNewName(line.trim(), idx);
  });

  DOM.resultTextarea.value = renamedLines.join('\n');
}

// Update Top Stats Summary
function updateStats() {
  const count = state.files.length;
  DOM.fileStatsSummary.textContent = `${count} file${count === 1 ? '' : 's'} in crate`;
}

// Render Table
function renderTable() {
  const filter = DOM.tableFilterInput.value.toLowerCase().trim();
  const filteredFiles = state.files.filter(f => {
    if (!filter) return true;
    return f.originalName.toLowerCase().includes(filter) || f.newName.toLowerCase().includes(filter);
  });

  if (state.files.length === 0) {
    DOM.tableCard.style.display = 'none';
    DOM.previewToolbar.style.display = 'none';
    DOM.dropzone.style.display = 'flex';
    DOM.previewTableBody.innerHTML = '';
    return;
  }

  DOM.tableCard.style.display = 'flex';
  DOM.previewToolbar.style.display = 'flex';
  DOM.dropzone.style.display = 'none';

  const carterSep = DOM.carterSeparator.value || '-CARTER-HERE';

  DOM.previewTableBody.innerHTML = filteredFiles.map((f, i) => {
    // Highlight the CARTER-HERE part inside newName for maximum satisfaction
    let formattedNewName = escapeHtml(f.newName);
    if (formattedNewName.includes(escapeHtml(carterSep))) {
      formattedNewName = formattedNewName.replace(
        escapeHtml(carterSep),
        `<span class="carter-tag">${escapeHtml(carterSep)}</span>`
      );
    }

    return `
      <tr data-id="${f.id}">
        <td style="color: var(--text-dim); font-size: 0.75rem;">${i + 1}</td>
        <td class="orig-name">${escapeHtml(f.originalName)}</td>
        <td class="arrow-col">➜</td>
        <td class="new-name">${formattedNewName}</td>
        <td class="file-size">${formatBytes(f.size)}</td>
        <td>
          <button class="btn-remove-row" data-id="${f.id}" title="Remove file from crate">✕</button>
        </td>
      </tr>
    `;
  }).join('');

  // Attach row delete handlers
  DOM.previewTableBody.querySelectorAll('.btn-remove-row').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      state.files = state.files.filter(f => f.id !== id);
      updateRules();
    });
  });
}

// Escape HTML for security
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}

// Toast Notifications
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3200);
}

// IN-PLACE FOLDER RENAMING (Chromium File System Access API)
async function performInPlaceRename() {
  if (!state.dirHandle || state.files.length === 0) {
    showToast('No directory currently opened for in-place rename.', 'warning');
    return;
  }

  const confirmMsg = `Are you sure you want to rename ${state.files.length} files directly in "${state.dirHandle.name}" with CARTER-HERE?`;
  if (!confirm(confirmMsg)) return;

  let successCount = 0;
  let failCount = 0;

  for (const item of state.files) {
    if (!item.handle || item.originalName === item.newName) continue;
    try {
      if ('move' in item.handle) {
        // Modern FileSystemFileHandle.move API
        await item.handle.move(item.newName);
        item.originalName = item.newName;
        successCount++;
      } else {
        // Fallback: Copy to new file with new name and remove old entry
        const fileData = await item.handle.getFile();
        const newHandle = await state.dirHandle.getFileHandle(item.newName, { create: true });
        const writable = await newHandle.createWritable();
        await writable.write(fileData);
        await writable.close();
        await state.dirHandle.removeEntry(item.originalName);
        item.handle = newHandle;
        item.originalName = item.newName;
        successCount++;
      }
    } catch (err) {
      console.error(`Failed renaming ${item.originalName}:`, err);
      failCount++;
    }
  }

  updateRules();
  if (failCount === 0) {
    showToast(`🎉 Successfully renamed all ${successCount} files on your PC with CARTER-HERE!`, 'success');
  } else {
    showToast(`Renamed ${successCount} files (${failCount} failed). Check folder permissions.`, 'warning');
  }
}

// DOWNLOAD ALL AS RENAMED ZIP
async function downloadRenamedZip() {
  if (state.files.length === 0) {
    showToast('Add some files or demo tracks first!', 'warning');
    return;
  }

  if (typeof JSZip === 'undefined') {
    showToast('JSZip library loading... please wait a moment.', 'warning');
    return;
  }

  showToast('Packing renamed crate into ZIP...', 'info');

  const zip = new JSZip();

  for (const item of state.files) {
    if (item.file) {
      // Real file from input or drag & drop
      zip.file(item.newName, item.file);
    } else {
      // Demo / simulated file: generate a placeholder audio/text buffer
      const dummyContent = `Crate Renamer // CARTER-HERE Edition\nOriginal: ${item.originalName}\nRenamed: ${item.newName}\nMandatory CARTER stamp active.\nEnjoy your crate!`;
      zip.file(item.newName, dummyContent);
    }
  }

  try {
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = `Crate_CARTER-HERE_${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    showToast('🎉 Renamed crate downloaded successfully with CARTER-HERE!', 'success');
  } catch (err) {
    console.error(err);
    showToast('Failed to generate ZIP: ' + err.message, 'warning');
  }
}

// Start application
document.addEventListener('DOMContentLoaded', init);
