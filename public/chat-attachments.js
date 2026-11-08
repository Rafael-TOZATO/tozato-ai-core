export function initChatAttachments({ form, input }) {
  const formEl = document.querySelector(form);
  const inputEl = document.querySelector(input);
  if (!formEl || !inputEl) {
    throw new Error("Elementos do chat não encontrados para inicializar os anexos.");
  }

  const attachments = [];
  const picker = document.createElement("input");
  picker.type = "file";
  picker.multiple = true;
  picker.accept = "image/*,audio/*,video/*,application/pdf,text/*,.csv,.json,.md,.log";
  picker.hidden = true;
  formEl.append(picker);

  function addFiles(fileList) {
    for (const file of Array.from(fileList || [])) {
      if (attachments.length >= 5) break;
      if (!attachments.some((item) =>
        item.name === file.name && item.size === file.size && item.lastModified === file.lastModified
      )) attachments.push(file);
    }
  }

  picker.addEventListener("change", () => {
    addFiles(picker.files);
    picker.value = "";
  });

  formEl.addEventListener("dragover", (event) => event.preventDefault());
  formEl.addEventListener("drop", (event) => {
    event.preventDefault();
    addFiles(event.dataTransfer.files);
  });

  inputEl.addEventListener("paste", (event) => {
    const pastedFiles = Array.from(event.clipboardData?.items || [])
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile())
      .filter(Boolean);
    if (pastedFiles.length) addFiles(pastedFiles);
  });

  let recorder = null;
  let mediaStream = null;
  let chunks = [];

  async function toggleRecording() {
    if (recorder && recorder.state === "recording") {
      recorder.stop();
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
        attachments.push(new File(chunks, "gravacao-" + Date.now() + "." + extension, { type }));
        mediaStream?.getTracks().forEach((track) => track.stop());
        mediaStream = null;
      }, { once: true });
      recorder.start();
    } catch (error) {
      mediaStream?.getTracks().forEach((track) => track.stop());
      mediaStream = null;
      console.error("[Chat audio]", error);
      window.alert("Não foi possível acessar o microfone. Verifique a permissão do navegador.");
    }
  }

  inputEl.addEventListener("keydown", (event) => {
    if (event.altKey && event.key.toLowerCase() === "a") {
      event.preventDefault();
      picker.click();
    }
    if (event.altKey && event.key.toLowerCase() === "m") {
      event.preventDefault();
      toggleRecording();
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
    },
    renderLinkCards() {},
  };
}
