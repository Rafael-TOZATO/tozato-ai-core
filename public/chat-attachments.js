import { initChatAttachments } from './chat-attachments.js';

document.addEventListener('DOMContentLoaded', () => {
  // Inicializa os anexos do chat conforme a documentação
  const att = initChatAttachments({
    form: '#chat-form',
    input: '#chat-input',
    bannerUrl: '/assets/og-image.jpg',
    cardHosts: ['github.com/Rafael-TOZATO', location.host],
  });

  const form = document.querySelector('#chat-form');
  const input = document.querySelector('#chat-input');
  const chatMessages = document.querySelector('#chat-messages') || form.parentElement;

  if (!form || !input) return;

  // Intercepta o envio do formulário para processar via API do Gemini
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const textValue = input.value.trim();
    const currentFiles = att.getAttachments();

    if (!textValue && currentFiles.length === 0) return;

    // 1. Renderiza a mensagem do usuário na tela
    appendMessage('user', textValue, currentFiles);

    // Limpa o input e a bandeja de anexos visualmente
    input.value = '';
    const formData = att.toFormData(textValue);
    att.clear();

    // 2. Adiciona indicador visual de carregamento ("Pensando...")
    const loadingId = appendMessage('assistant', 'Pensando...');

    try {
      // 3. Envia os dados para a API do servidor (Gemini)
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData, // Envia o texto e os arquivos convertidos (incluindo o WAV)
      });

      if (!response.ok) {
        throw new Error(`Erro no servidor: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Remove o indicador de carregamento e exibe a resposta real da IA
      removeMessage(loadingId);
      appendMessage('assistant', data.reply || data.text || 'Resposta recebida.');

    } catch (error) {
      console.error('[Chat Error]', error);
      removeMessage(loadingId);
      appendMessage('assistant', 'Desculpe, ocorreu um erro ao processar sua solicitação com a API.');
    }
  });

  // Funções auxiliares para manipulação visual das mensagens
  function appendMessage(sender, text, attachedFiles = []) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender}-message`;
    const msgId = 'msg-' + Date.now() + '-' + Math.random().toString(36.substr(2, 9));
    msgDiv.id = msgId;

    let filesHtml = '';
    if (attachedFiles && attachedFiles.length > 0) {
      filesHtml = '<div class="msg-attachments-preview">';
      attachedFiles.forEach(f => {
        const url = URL.createObjectURL(f);
        if (f.type.startsWith('image/')) {
          filesHtml += `<img src="${url}" alt="${f.name}" style="max-width:150px; border-radius:8px; display:block; margin-top:4px;">`;
        } else if (f.type.startsWith('audio/')) {
          filesHtml += `<audio src="${url}" controls style="margin-top:4px;"></audio>`;
        } else {
          filesHtml += `<span style="font-size:12px; display:block; margin-top:4px;">📎 ${f.name}</span>`;
        }
      });
      filesHtml += '</div>';
    }

    msgDiv.innerHTML = `
      <div class="msg-content">
        <p>${escapeHtml(text)}</p>
        ${filesHtml}
      </div>
    `;

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Renderiza cards de link se houver URLs na resposta
    if (sender === 'assistant') {
      att.renderLinkCards(msgDiv);
    }

    return msgId;
  }

  function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
});
