/**
 * Tozato - Core AI | Anexos do chat: clipe, câmera, microfone e card de link.
 * JavaScript puro, sem dependências. Requer HTTPS (ou localhost) para câmera e microfone.
 *
 * Uso:
 *   import { initChatAttachments } from './chat-attachments.js';
 *   const att = initChatAttachments({
 *     form: '#chat-form',            // formulário do chat
 *     input: '#chat-input',          // campo de texto
 *     bannerUrl: '/assets/og-image.jpg',
 *     cardHosts: ['github.com/Rafael-TOZATO', location.host],
 *   });
 *   // No envio:  const files = att.getAttachments();  ...  att.clear();
 *   // Ao renderizar uma mensagem:  att.renderLinkCards(elementoDaMensagem);
 */

const ICON = {
  clip: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.4 11.1l-9.2 9.2a6 6 0 01-8.5-8.5l9.2-9.2a4 4 0 115.7 5.7l-9.2 9.2a2 2 0 01-2.8-2.8l8.5-8.5"/></svg>',
  camera: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>',
  mic: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 01-14 0v-1M12 18v4M8 22h8"/></svg>',
  stop: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
  close: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
};

const MAX_FILE_MB = 25;

export function initChatAttachments(opts = {}) {
  const cfg = {
    form: '#chat-form',
    input: '#chat-input',
    bannerUrl: '/assets/og-image.jpg',
    cardHosts: [location.host],
    cardTitle: 'Tozato - Core AI',
    cardDescription: 'Transforme ideias em impacto',
    maxFileMB: MAX_FILE_MB,
    trayBefore: false, // true: bandeja de anexos acima do elemento `form`
    transcribe: true, // ditado por voz (Web Speech API) quando disponível
    lang: 'pt-BR',
    ...opts,
  };

  const form = document.querySelector(cfg.form);
  const input = document.querySelector(cfg.input);
  if (!form || !input) throw new Error('chat-attachments: form/input não encontrados.');

  const files = [];
  const state = { recorder: null, chunks: [], stream: null, recognition: null };

  /* ---------- Barra de ferramentas ---------- */
  const bar = document.createElement('div');
  bar.className = 'tca-bar';
  bar.innerHTML = `
    <button type="button" class="tca-btn" data-act="clip" aria-label="Anexar arquivo" title="Anexar arquivo">${ICON.clip}</button>
    <button type="button" class="tca-btn" data-act="camera" aria-label="Câmera" title="Câmera">${ICON.camera}</button>
    <button type="button" class="tca-btn" data-act="mic" aria-label="Gravar áudio" title="Gravar áudio">${ICON.mic}</button>
    <input type="file" class="tca-file" multiple hidden
      accept="image/*,video/*,audio/*,application/pdf,.txt,.md,.csv,.json,.xlsx,.docx,.pptx">
    <input type="file" class="tca-cam-fallback" accept="image/*" capture="environment" hidden>`;
  const tray = document.createElement('div');
  tray.className = 'tca-tray';
  if (cfg.trayBefore) form.insertAdjacentElement('beforebegin', tray); else form.prepend(tray);
  input.insertAdjacentElement('beforebegin', bar);

  const fileInput = bar.querySelector('.tca-file');
  const camFallback = bar.querySelector('.tca-cam-fallback');
  const micBtn = bar.querySelector('[data-act="mic"]');

  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    if (btn.dataset.act === 'clip') fileInput.click();
    if (btn.dataset.act === 'camera') openCamera();
    if (btn.dataset.act === 'mic') toggleMic();
  });

  fileInput.addEventListener('change', () => { addFiles([...fileInput.files]); fileInput.value = ''; });
  camFallback.addEventListener('change', () => { addFiles([...camFallback.files]); camFallback.value = ''; });

  // Colar imagem da área de transferência
  input.addEventListener('paste', (e) => {
    const imgs = [...(e.clipboardData?.files || [])].filter((f) => f.type.startsWith('image/'));
    if (imgs.length) addFiles(imgs);
  });

  /* ---------- Gerenciamento de anexos ---------- */
  function addFiles(list) {
    for (const f of list) {
      if (f.size > cfg.maxFileMB * 1024 * 1024) {
        notify(`"${f.name}" excede ${cfg.maxFileMB} MB.`);
        continue;
      }
      files.push(f);
    }
    renderTray();
  }

  function removeFile(i) {
    files.splice(i, 1);
    renderTray();
  }

  function renderTray() {
    tray.innerHTML = '';
    files.forEach((f, i) => {
      const chip = document.createElement('div');
      chip.className = 'tca-chip';
      const url = URL.createObjectURL(f);
      let preview;
      if (f.type.startsWith('image/')) preview = `<img src="${url}" alt="">`;
      else if (f.type.startsWith('audio/')) preview = `<audio src="${url}" controls></audio>`;
      else if (f.type.startsWith('video/')) preview = `<video src="${url}" muted></video>`;
      else preview = `<span class="tca-ext">${(f.name.split('.').pop() || 'file').slice(0, 4)}</span>`;
      chip.innerHTML = `${preview}<span class="tca-name"></span><button type="button" class="tca-x" aria-label="Remover">${ICON.close}</button>`;
      chip.querySelector('.tca-name').textContent = f.name;
      chip.querySelector('.tca-x').addEventListener('click', () => { URL.revokeObjectURL(url); removeFile(i); });
      tray.appendChild(chip);
    });
    form.dispatchEvent(new CustomEvent('attachments:change', { detail: { count: files.length } }));
  }

  /* ---------- Câmera ---------- */
  async function openCamera() {
    if (!navigator.mediaDevices?.getUserMedia) { camFallback.click(); return; }
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    } catch (err) {
      camFallback.click(); // permissão negada ou sem câmera: usa seletor nativo
      return;
    }
    const modal = document.createElement('div');
    modal.className = 'tca-modal';
    modal.innerHTML = `
      <div class="tca-modal-box" role="dialog" aria-label="Câmera">
        <video autoplay playsinline muted></video>
        <div class="tca-modal-actions">
          <button type="button" class="tca-secondary" data-a="flip">Trocar câmera</button>
          <button type="button" class="tca-primary" data-a="shot">Capturar</button>
          <button type="button" class="tca-secondary" data-a="cancel">Cancelar</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    const video = modal.querySelector('video');
    video.srcObject = stream;
    let facing = 'environment';

    const close = () => { stream.getTracks().forEach((t) => t.stop()); modal.remove(); };

    modal.addEventListener('click', async (e) => {
      const a = e.target.dataset.a;
      if (!a) return;
      if (a === 'cancel') close();
      if (a === 'shot') {
        const c = document.createElement('canvas');
        c.width = video.videoWidth; c.height = video.videoHeight;
        c.getContext('2d').drawImage(video, 0, 0);
        c.toBlob((blob) => {
          if (blob) addFiles([new File([blob], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' })]);
          close();
        }, 'image/jpeg', 0.92);
      }
      if (a === 'flip') {
        facing = facing === 'environment' ? 'user' : 'environment';
        stream.getTracks().forEach((t) => t.stop());
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: false });
          video.srcObject = stream;
        } catch { notify('Não foi possível trocar de câmera.'); }
      }
    });
  }

  /* ---------- Microfone ---------- */
  async function toggleMic() {
    if (state.recorder && state.recorder.state === 'recording') { stopMic(); return; }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      notify('Gravação de áudio não suportada neste navegador.');
      return;
    }
    try {
      state.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch { notify('Permissão de microfone negada.'); return; }

    state.chunks = [];
    const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'].find((m) => MediaRecorder.isTypeSupported(m)) || '';
    state.recorder = new MediaRecorder(state.stream, mime ? { mimeType: mime } : undefined);
    state.recorder.ondataavailable = (e) => { if (e.data.size) state.chunks.push(e.data); };
    state.recorder.onstop = () => {
      const type = state.recorder.mimeType || 'audio/webm';
      const ext = type.includes('mp4') ? 'm4a' : type.includes('ogg') ? 'ogg' : 'webm';
      const blob = new Blob(state.chunks, { type });
      state.stream.getTracks().forEach((t) => t.stop());
      micBtn.classList.remove('is-recording');
      micBtn.innerHTML = ICON.mic;
      if (blob.size) addFiles([new File([blob], `audio-${Date.now()}.${ext}`, { type })]);
    };
    state.recorder.start();
    micBtn.classList.add('is-recording');
    micBtn.innerHTML = ICON.stop;

    // Ditado opcional: transcreve a fala para o campo de texto
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (cfg.transcribe && SR) {
      const base = input.value ? input.value.trimEnd() + ' ' : '';
      const rec = new SR();
      rec.lang = cfg.lang; rec.interimResults = true; rec.continuous = true;
      rec.onresult = (ev) => {
        let txt = '';
        for (const r of ev.results) txt += r[0].transcript;
        input.value = base + txt;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      };
      rec.onerror = () => {};
      try { rec.start(); state.recognition = rec; } catch {}
    }
  }

  function stopMic() {
    if (state.recorder?.state === 'recording') state.recorder.stop();
    if (state.recognition) { try { state.recognition.stop(); } catch {} state.recognition = null; }
  }

  /* ---------- Card de link ---------- */
  const URL_RE = /https?:\/\/[^\s<>"')]+/g;

  function matchesHost(u) {
    const full = u.host + u.pathname;
    return cfg.cardHosts.some((h) => full.toLowerCase().startsWith(h.toLowerCase()));
  }

  function renderLinkCards(root) {
    const text = root.textContent || '';
    const seen = new Set();
    for (const raw of text.match(URL_RE) || []) {
      let u;
      try { u = new URL(raw); } catch { continue; }
      if (seen.has(u.href) || !matchesHost(u)) continue;
      seen.add(u.href);
      const a = document.createElement('a');
      a.className = 'tca-card';
      a.href = u.href; a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.innerHTML = `
        <img src="${cfg.bannerUrl}" alt="${cfg.cardTitle}" loading="lazy">
        <div class="tca-card-body">
          <strong></strong>
          <span class="tca-card-desc"></span>
          <span class="tca-card-host"></span>
        </div>`;
      a.querySelector('strong').textContent = cfg.cardTitle;
      a.querySelector('.tca-card-desc').textContent = cfg.cardDescription;
      a.querySelector('.tca-card-host').textContent = u.host;
      root.appendChild(a);
    }
  }

  function notify(msg) {
    form.dispatchEvent(new CustomEvent('attachments:error', { detail: msg }));
    console.warn('[chat-attachments]', msg);
  }

  return {
    getAttachments: () => [...files],
    /** FormData pronto para fetch(): campo "text" + "files". */
    toFormData(text = input.value) {
      const fd = new FormData();
      fd.append('text', text);
      files.forEach((f) => fd.append('files', f, f.name));
      return fd;
    },
    clear() { stopMic(); files.length = 0; renderTray(); },
    renderLinkCards,
  };
}
