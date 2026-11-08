export function initChatAttachments({ form, input }) {
  const formEl = document.querySelector(form);
  const inputEl = document.querySelector(input);
  if (!formEl || !inputEl) {
    throw new Error("Elementos do chat não encontrados para inicializar os anexos.");
  }

  const attachments = [];
  const bar = document.createElement("div");
  bar.className = "tca-bar";

  const tray = document.createElement("div");
  tray.className = "tca-tray";
  tray.setAttribute("aria-live", "polite");

  const picker = document.createElement("input");
  picker.type = "file";
  picker.multiple = true;
  picker.accept = "image/*,audio/*,video/*,application/pdf,text/*,.csv,.json,.md,.log";
  picker.hidden = true;

  const cameraPicker = document.createElement("input");
  cameraPicker.type = "file";
  cameraPicker.accept = "image/*";
  cameraPicker.capture = "environment";
  cameraPicker.hidden = true;

  function makeButton(label, title) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tca-btn";
    button.textContent = label;
    button.title = title;
    button.setAttribute("aria-label", title);
    return button;
  }

  const attachButton = makeButton("＋", "Anexar arquivo");
  const cameraButton = makeButton("▧", "Tirar foto");
  const recordButton = makeButton("●", "Gravar áudio");
  bar.append(attachButton, cameraButton, recordButton);
  formEl.insertBefore(bar, inputEl);
  formEl.append(picker, cameraPicker);
  formEl.insertAdjacentElement("afterend", tray);

  function renderTray() {
    tray.replaceChildren();
    attachments.forEach((file, index) => {
      const chip = document.createElement("div");
      chip.className = "tca-chip";
      const name = document.createElement("span");
      name.className = "tca-name";
      name.textContent = file.name;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "tca-x";
      remove.textContent = "×";
      remove.title = "Remover anexo";
      remove.setAttribute("aria-label", "Remover " + file.name);
      remove.addEventListener("click", () => {
        attachments.splice(index, 1);
        renderTray();
      });
      chip.append(name, remove);
      tray.append(chip);
    });
  }

  function addFiles(fileList) {
    for (const file of Array.from(fileList || [])) {
      if (attachments.length >= 5) {
        window.alert("É permitido enviar até 5 anexos por mensagem.");
        break;
      }
      if (!attachments.some((item) => item.name === file.name && item.size === file.size && item.lastModified === file.lastModified)) {
        attachments.push(file);
      }
    }
    renderTray();
  }

  attachButton.addEventListener("click", () => picker.click());
  cameraButton.addEventListener("click", () => cameraPicker.click());
  picker.addEventListener("change", () => {
    addFiles(picker.files);
    picker.value = "";
  });
  cameraPicker.addEventListener("change", () => {
    addFiles(cameraPicker.files);
    cameraPicker.value = "";
  });

  let recorder = null;
  let mediaStream = null;
  let chunks = [];

  recordButton.addEventListener("click", async () => {
    if (recorder && recorder.state === "recording") {
      recorder.stop();
      recordButton.classList.remove("is-recording");
      recordButton.title = "Gravar áudio";
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      window.alert("A gravação de áudio não é suportada neste navegador.");
      return;
    }

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((type) =>
        MediaRecorder.isTypeSupported(type)
      );
      recorder = mimeType ? new MediaRecorder(mediaStream, { mimeType }) : new MediaRecorder(mediaStream);
      chunks = [];
      recorder.addEventListener("dataavailable", (event) => {
        if (event.data && event.data.size) chunks.push(event.data);
      });
      recorder.addEventListener("stop", () => {
        const type = recorder.mimeType || "audio/webm";
        const extension = type.includes("mp4") ? "m4a" : "webm";
        const audioFile = new File(chunks, "gravacao-" + Date.now() + "." + extension, { type });
        addFiles([audioFile]);
        mediaStream?.getTracks().forEach((track) => track.stop());
        mediaStream = null;
      }, { once: true });
      recorder.start();
      recordButton.classList.add("is-recording");
      recordButton.title = "Parar gravação";
    } catch (error) {
      mediaStream?.getTracks().forEach((track) => track.stop());
      mediaStream = null;
      console.error("[Chat audio]", error);
      window.alert("Não foi possível acessar o microfone. Verifique a permissão do navegador.");
    }
  });

  return {
    getAttachments() {
      return attachments.slice();
    },
    toFormData(message) {
      const data = new FormData();
      data.append("message", message || "");
      attachments.forEach((file) => data.append("files", file, file.name));
      return data;
    },
    clear() {
      attachments.splice(0, attachments.length);
      renderTray();
    },
    renderLinkCards() {},
  };
}
