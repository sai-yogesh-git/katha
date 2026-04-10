// ============================================================
// AI Chat Assistant Page
// /pages/chat.js
// ============================================================

const ChatPage = {
  _messages: [],
  _isTyping: false,

  async render() {
    const content = document.getElementById('page-content');
    content.innerHTML = this._buildHTML();
    lucide.createIcons({ nodes: [content] });
    this._messages = [];
    this._addBotMessage(`🙏 Namaste! I'm your **CareBridge AI Health Assistant**.\n\nI can help you with:\n• Medicine information\n• Symptom guidance\n• Health tips\n• Diet & lifestyle advice\n\nHow can I help you today?`);
    this._bindEvents();
  },

  _buildHTML() {
    return `
      <div class="animate-fade-in" style="display:flex;flex-direction:column;height:calc(100vh - 180px);min-height:500px">

        ${Components.pageHeader(
          'AI Chat Assistant',
          'Ask health questions in plain language',
          'message-circle',
          'AI Chat'
        )}

        <!-- Quick Prompts -->
        <div class="flex gap-2 flex-wrap mb-4">
          ${[
            '💊 What are my medicines?',
            '🩸 Blood sugar tips',
            '❤️ Blood pressure info',
            '😴 Sleep advice',
            '🥗 Diet guidance',
          ].map(p => `
            <button class="quick-prompt-btn px-4 py-2 rounded-xl text-sm font-medium border border-gray-700 text-gray-300 bg-gray-800/60 hover:border-primary-500 hover:text-primary-300 hover:bg-primary-600/10 transition-all"
              data-prompt="${p.slice(2).trim()}">
              ${p}
            </button>
          `).join('')}
        </div>

        <!-- Chat Window -->
        <div class="flex-1 card overflow-y-auto" style="padding:20px;min-height:0;border-radius:20px" id="chat-window">
          <div id="chat-messages" class="space-y-4"></div>
          <div id="typing-indicator" class="hidden mt-4">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">AI</div>
              <div class="chat-bubble bot typing-indicator" style="padding:14px 18px">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Bar -->
        <div class="mt-4 flex gap-3 items-end">
          <div class="flex-1 relative">
            <textarea
              id="chat-input"
              class="input-field w-full pr-12"
              placeholder="Type your health question here…"
              rows="1"
              style="resize:none;max-height:120px;overflow-y:auto;line-height:1.5;padding-right:48px"
              aria-label="Chat message input"
            ></textarea>
            <button id="voice-chat-btn" class="absolute right-3 bottom-3 p-1 rounded-lg text-gray-500 hover:text-primary-400 transition-colors" title="Voice input">
              <i data-lucide="mic" style="width:18px;height:18px"></i>
            </button>
          </div>
          <button id="send-chat-btn" class="btn-primary flex-shrink-0" style="height:50px;width:50px;padding:0;border-radius:14px" aria-label="Send message">
            <i data-lucide="send" style="width:20px;height:20px"></i>
          </button>
        </div>

        <p class="text-center text-xs text-gray-600 mt-2">⚠️ AI responses are for guidance only. Always consult your doctor for medical decisions.</p>
      </div>
    `;
  },

  _addUserMessage(text) {
    this._messages.push({ role: 'user', text, time: Utils.currentTime() });
    this._renderMessages();
  },

  _addBotMessage(text) {
    this._messages.push({ role: 'bot', text, time: Utils.currentTime() });
    this._renderMessages();
  },

  _renderMessages() {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    container.innerHTML = this._messages.map((msg, i) => {
      if (msg.role === 'user') {
        return `
          <div class="flex justify-end items-end gap-2 animate-slide-up">
            <div class="flex flex-col items-end gap-1">
              <div class="chat-bubble user" id="msg-${i}">${this._formatText(msg.text)}</div>
              <span class="text-xs text-gray-600 px-1">${msg.time}</span>
            </div>
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 text-xs font-bold mb-5">RK</div>
          </div>
        `;
      } else {
        return `
          <div class="flex items-end gap-2 animate-slide-up">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center flex-shrink-0 text-xs font-bold mb-5">AI</div>
            <div class="flex flex-col gap-1">
              <div class="chat-bubble bot" id="msg-${i}">${this._formatText(msg.text)}</div>
              <span class="text-xs text-gray-600 px-1">${msg.time}</span>
            </div>
          </div>
        `;
      }
    }).join('');

    // Scroll to bottom
    const chatWindow = document.getElementById('chat-window');
    if (chatWindow) {
      setTimeout(() => { chatWindow.scrollTop = chatWindow.scrollHeight; }, 50);
    }
  },

  _formatText(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n•/g, '<br>•')
      .replace(/\n/g, '<br>');
  },

  _showTyping(show) {
    const ind = document.getElementById('typing-indicator');
    if (ind) ind.classList.toggle('hidden', !show);
    const chatWindow = document.getElementById('chat-window');
    if (chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight;
  },

  async _sendMessage() {
    const input = document.getElementById('chat-input');
    const text  = input.value.trim();
    if (!text || this._isTyping) return;

    this._addUserMessage(text);
    input.value = '';
    input.style.height = 'auto';

    this._isTyping = true;
    this._showTyping(true);
    document.getElementById('send-chat-btn').disabled = true;

    try {
      const res = await API.getChatResponse(text);
      this._showTyping(false);
      this._addBotMessage(res.data.response);
    } catch (err) {
      this._showTyping(false);
      this._addBotMessage('❌ Sorry, I encountered an error. Please try again in a moment.');
      Components.toast('Failed to get response. Please retry.', 'error');
    } finally {
      this._isTyping = false;
      document.getElementById('send-chat-btn').disabled = false;
      input.focus();
    }
  },

  _bindEvents() {
    const input  = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat-btn');

    // Send on button click
    sendBtn.addEventListener('click', () => this._sendMessage());

    // Send on Enter (Shift+Enter for new line)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this._sendMessage();
      }
    });

    // Auto-resize textarea
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });

    // Quick prompts
    document.querySelectorAll('.quick-prompt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        input.value = btn.dataset.prompt;
        input.focus();
        this._sendMessage();
      });
    });

    // Voice chat btn (simulated)
    document.getElementById('voice-chat-btn').addEventListener('click', () => {
      const examplePhrases = [
        'What should I know about my blood pressure?',
        'Are there any side effects of Metformin?',
        'What foods should I avoid for diabetes?',
        'How can I improve my sleep quality?',
      ];
      input.value = examplePhrases[Math.floor(Math.random() * examplePhrases.length)];
      input.focus();
      Components.toast('Voice captured! Press Send to ask.', 'info');
    });
  },
};
