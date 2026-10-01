// Minimalist Crate Renamer // CARTER-HERE
let files = [];
let dirHandle = null;

const sampleFiles = [
  '01_calvin_harris_-_summer_[320kbps].mp3',
  'daft_punk_one_more_time_remix.wav',
  'fisher_losing_it_extended_mix.aiff',
  'fred_again_marea_weve_lost_dancing.mp3',
  'bicep_glue_original_mix.flac'
];

// DOM
const dropzone = document.getElementById('dropzone');
const filePicker = document.getElementById('filePicker');
const btnPickFolder = document.getElementById('btnPickFolder');
const btnLoadDemo = document.getElementById('btnLoadDemo');
const btnClear = document.getElementById('btnClear');
const prefixInput = document.getElementById('prefixInput');
const suffixInput = document.getElementById('suffixInput');
const letterCase = document.getElementById('letterCase');
const carterStyle = document.getElementById('carterStyle');
const cleanSpaces = document.getElementById('cleanSpaces');
const stripJunk = document.getElementById('stripJunk');
const resultsSection = document.getElementById('resultsSection');
const resultsCount = document.getElementById('resultsCount');
const previewBody = document.getElementById('previewBody');
const btnDownloadZip = document.getElementById('btnDownloadZip');
const btnInPlaceRename = document.getElementById('btnInPlaceRename');
const toast = document.getElementById('toast');
const carterLockBadge = document.getElementById('carterLockBadge');

// Initial Setup
function init() {
  setupEvents();
  loadSamples(false);
}

function setupEvents() {
  // Input triggers for live recalculation
  [prefixInput, suffixInput, letterCase, carterStyle, cleanSpaces, stripJunk].forEach(el => {
    el.addEventListener('input', update);
    el.addEventListener('change', update);
  });

  // Locked badge micro-interaction
  carterLockBadge.addEventListener('click', () => {
    showToast('CARTER-HERE is permanent — whether you want it or not!');
  });

  // Samples & Clear
  btnLoadDemo.addEventListener('click', () => loadSamples(true));
  btnClear.addEventListener('click', clearFiles);

  // File Picker
  filePicker.addEventListener('change', (e) => {
    if (e.target.files?.length) {
      addFiles(Array.from(e.target.files));
      filePicker.value = '';
    }
  });

  // Folder Picker (File System Access)
  btnPickFolder.addEventListener('click', pickFolder);

  // Dropzone
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone.addEventListener('drop', handleDrop);

  // Actions
  btnDownloadZip.addEventListener('click', downloadZip);
  btnInPlaceRename.addEventListener('click', renameInPlace);
}

// Compute new name with mandatory CARTER-HERE
function computeName(originalName) {
  const lastDot = originalName.lastIndexOf('.');
  const ext = (lastDot > 0) ? originalName.slice(lastDot + 1) : '';
  let base = (lastDot > 0) ? originalName.slice(0, lastDot) : originalName;

  // Clean junk tags if checked
  if (stripJunk.checked) {
    base = base.replace(/\[\s*(320|320kbps|flac|wav|mp3|official audio|free dl|remix|hq|rip)\s*\]/gi, '');
    base = base.replace(/\(\s*(official audio|free dl|hq|rip)\s*\)/gi, '');
    base = base.replace(/\b(www\.[a-z0-9\-]+\.[a-z]{2,}|[a-z0-9\-]+\.com)\b/gi, '');
  }

  // Clean underscores & spaces
  if (cleanSpaces.checked) {
    base = base.replace(/_/g, ' ');
    base = base.replace(/\s+/g, ' ').trim();
  }

  // Letter case
  if (letterCase.value === 'uppercase') {
    base = base.toUpperCase();
  } else if (letterCase.value === 'lowercase') {
    base = base.toLowerCase();
  } else if (letterCase.value === 'titlecase') {
    base = base.replace(/\b[a-zA-Z]/g, c => c.toUpperCase());
  }

  // Custom prefix / suffix
  if (prefixInput.value) {
    base = prefixInput.value + base;
  }
  if (suffixInput.value) {
    base = base + suffixInput.value;
  }

  // MANDATORY: CARTER-HERE ALWAYS AT THE END
  const tag = carterStyle.value || '-CARTER-HERE';
  if (!base.endsWith(tag)) {
    base = base + tag;
  }

  return ext ? `${base}.${ext}` : base;
}

// Add files
function addFiles(newFiles) {
  const items = newFiles.map(f => ({
    id: Math.random().toString(36).slice(2),
    file: f,
    handle: null,
    original: f.name,
    renamed: ''
  }));
  files = files.concat(items);
  update();
  showToast(`Added ${newFiles.length} file(s)`);
}

// Load Samples
function loadSamples(notify = true) {
  files = sampleFiles.map(name => ({
    id: Math.random().toString(36).slice(2),
    file: null,
    handle: null,
    original: name,
    renamed: ''
  }));
  dirHandle = null;
  btnInPlaceRename.style.display = 'none';
  update();
  if (notify) showToast('Loaded sample tracks');
}

// Clear
function clearFiles() {
  files = [];
  dirHandle = null;
  btnInPlaceRename.style.display = 'none';
  update();
  showToast('Cleared list');
}

// Folder Selection
async function pickFolder() {
  if (!('showDirectoryPicker' in window)) {
    showToast('Folder renaming is supported in Chrome/Edge. Use file picker instead.');
    filePicker.click();
    return;
  }

  try {
    dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
    const list = [];
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file') {
        const f = await entry.getFile();
        list.push({
          id: Math.random().toString(36).slice(2),
          file: f,
          handle: entry,
          original: f.name,
          renamed: ''
        });
      }
    }
    if (!list.length) {
      showToast('Selected folder is empty');
      return;
    }
    files = list;
    btnInPlaceRename.style.display = 'inline-flex';
    update();
    showToast(`Loaded ${list.length} files from folder`);
  } catch (err) {
    if (err.name !== 'AbortError') showToast('Folder access cancelled or denied');
  }
}

// Drag & drop
async function handleDrop(e) {
  e.preventDefault();
  dropzone.classList.remove('dragover');

  const dropped = [];
  if (e.dataTransfer.items) {
    for (const item of e.dataTransfer.items) {
      const f = item.getAsFile();
      if (f) dropped.push(f);
    }
  } else if (e.dataTransfer.files) {
    dropped.push(...Array.from(e.dataTransfer.files));
  }

  if (dropped.length) addFiles(dropped);
}

// Update UI
function update() {
  files.forEach(f => {
    f.renamed = computeName(f.original);
  });

  if (!files.length) {
    resultsSection.style.display = 'none';
    return;
  }

  resultsSection.style.display = 'flex';
  resultsCount.textContent = `${files.length} file${files.length === 1 ? '' : 's'}`;

  const tag = carterStyle.value || '-CARTER-HERE';
  previewBody.innerHTML = files.map(f => {
    const highlighted = escapeHtml(f.renamed).replace(
      escapeHtml(tag),
      `<span class="carter-pill">${escapeHtml(tag)}</span>`
    );

    return `
      <tr>
        <td class="orig-text">${escapeHtml(f.original)}</td>
        <td class="arrow">→</td>
        <td class="new-text">${highlighted}</td>
        <td>
          <button class="btn-del" data-id="${f.id}" title="Remove">×</button>
        </td>
      </tr>
    `;
  }).join('');

  previewBody.querySelectorAll('.btn-del').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      files = files.filter(f => f.id !== id);
      update();
    });
  });
}

// Download ZIP
async function downloadZip() {
  if (!files.length) return;
  if (typeof JSZip === 'undefined') {
    showToast('Loading ZIP library...');
    return;
  }

  showToast('Preparing ZIP download...');
  const zip = new JSZip();

  files.forEach(f => {
    if (f.file) {
      zip.file(f.renamed, f.file);
    } else {
      zip.file(f.renamed, `Renamed file: ${f.renamed}\nIncludes CARTER-HERE.`);
    }
  });

  try {
    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `renamed_crate_CARTER-HERE_${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Downloaded ZIP with CARTER-HERE! 🎉');
  } catch (err) {
    showToast('Failed to create ZIP');
  }
}

// In-place rename
async function renameInPlace() {
  if (!dirHandle || !files.length) return;
  if (!confirm(`Rename ${files.length} files in folder with CARTER-HERE?`)) return;

  let count = 0;
  for (const item of files) {
    if (!item.handle || item.original === item.renamed) continue;
    try {
      if ('move' in item.handle) {
        await item.handle.move(item.renamed);
        item.original = item.renamed;
        count++;
      } else {
        const fileData = await item.handle.getFile();
        const newHandle = await dirHandle.getFileHandle(item.renamed, { create: true });
        const writer = await newHandle.createWritable();
        await writer.write(fileData);
        await writer.close();
        await dirHandle.removeEntry(item.original);
        item.handle = newHandle;
        item.original = item.renamed;
        count++;
      }
    } catch (err) {
      console.error(err);
    }
  }

  update();
  showToast(`Renamed ${count} files directly on your PC! 🎉`);
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

document.addEventListener('DOMContentLoaded', init);
