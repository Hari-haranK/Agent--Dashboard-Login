// Enhanced loading state management
class LoadingManager {
    constructor(container, steps) {
        this.container = container;
        this.steps = steps;
        this.currentStep = 0;
    }

    createLoadingUI() {
        const loadingContainer = document.createElement('div');
        loadingContainer.className = 'loading-container fade-in-up';
        loadingContainer.innerHTML = `
            <div class="loading-progress">
                <div class="progress-icons">
                    ${this.steps.map(step => `
                        <div class="progress-icon">
                            <i class="fas ${step.icon} text-4xl"></i>
                            <div class="progress-line"></div>
                        </div>
                    `).join('')}
                </div>
                <div id="loadingStatus" class="mt-4 text-center text-lg font-medium"></div>
                <div id="loadingSubStatus" class="mt-2 text-center text-sm text-muted"></div>
            </div>
        `;
        return loadingContainer;
    }

    async start() {
        this.container.innerHTML = '';
        const loadingUI = this.createLoadingUI();
        this.container.appendChild(loadingUI);
        const icons = loadingUI.querySelectorAll('.progress-icon');
        
        try {
            for (let i = 0; i < this.steps.length; i++) {
                const step = this.steps[i];
                icons[i].classList.add('active');
                await step.action();
                if (i < this.steps.length - 1) {
                    const line = icons[i].querySelector('.progress-line');
                    if (line) line.classList.add('active');
                }
            }
            return true;
        } catch (error) {
            console.error('Loading error:', error);
            showModal('Error', error.message || 'An unexpected error occurred', 'error');
            return false;
        }
    }
}

// Enhanced modal system
class ModalManager {
    static show(options) {
        const {
            title,
            message,
            type = 'info',
            buttons = [{text: 'OK', type: 'primary', onClick: () => this.close()}]
        } = options;

        const iconClass = {
            info: 'fas fa-info-circle text-blue-500',
            success: 'fas fa-check-circle text-green-500',
            error: 'fas fa-exclamation-circle text-red-500',
            warning: 'fas fa-exclamation-triangle text-yellow-500'
        };

        const modal = document.createElement('div');
        modal.className = 'modal-overlay modal-overlay-animated';
        modal.innerHTML = `
            <div class="modal-content modal-content-animated">
                <div class="w-full p-4 rounded-lg bg-card">
                    <div class="flex flex-col items-center text-center space-y-2">
                        <i class="${iconClass[type]} text-4xl"></i>
                        <h3 class="text-xl font-bold">${title}</h3>
                        <p class="text-base text-body">${message}</p>
                    </div>
                </div>
                <div class="mt-4 flex justify-center space-x-2">
                    ${buttons.map(btn => `
                        <button class="btn-${btn.type}">${btn.text}</button>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // --- START FIX ---
        // Add event listeners to the buttons we just created
        const modalButtons = modal.querySelectorAll('button');
        modalButtons.forEach((btn, index) => {
            // Get the original button config from the 'options'
            if (buttons[index] && buttons[index].onClick) {
                // Attach the corresponding onClick function
                btn.addEventListener('click', buttons[index].onClick);
            }
        });
        // --- END FIX ---

        return modal;
    }

    static close() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.classList.add('fade-out');
            setTimeout(() => modal.remove(), 300);
        }
    }
}

// Enhanced chat widget
class ChatWidget {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('chat-input-field')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    toggle() {
        const popup = document.getElementById('chat-popup');
        this.isOpen = !this.isOpen;
        popup.style.transform = this.isOpen ? 'scale(1)' : 'scale(0)';
        if (this.isOpen) {
            document.getElementById('chat-input-field')?.focus();
        }
    }

    async sendMessage() {
        const input = document.getElementById('chat-input-field');
        const message = input.value.trim();
        if (!message) return;

        this.addMessage(message, 'user');
        input.value = '';

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });

            if (!response.ok) throw new Error('Failed to send message');
            
            const data = await response.json();
            this.addMessage(data.response, 'assistant');
        } catch (error) {
            console.error('Chat error:', error);
            this.addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
        }
    }

    addMessage(text, sender) {
        const chatBody = document.getElementById('chat-body');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        // --- START ROBUST FIX ---
        // 1. Convert all newline characters (\n) to HTML <br> tags
        const html = text.replace(/\n/g, '<br>');

        // 2. Use .innerHTML to make the browser render the <br> tags
        messageDiv.innerHTML = html;
        // --- END ROBUST FIX ---

        chatBody.appendChild(messageDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }
}

// Initialize enhanced features
// In enhanced-scripts.js

// FIND THIS in enhanced-scripts.js
document.addEventListener('DOMContentLoaded', () => {
    window.chatWidget = new ChatWidget();
    
    // Apply smooth transitions to all interactive elements
    document.querySelectorAll('button, a, .input-field').forEach(element => {
        element.classList.add('transition-all', 'duration-300', 'ease-in-out');
    });

    // --- START: ADD THIS NEW BLOCK ---
    // Check for the 'login_success' query parameter from the server
    const urlParams = new URLSearchParams(window.location.search);
    const welcomeName = urlParams.get('login_success');

    if (welcomeName) {
        // Use ModalManager to show the toast
        ModalManager.show({
            title: `Welcome back, ${welcomeName}!`,
            message: 'You have successfully logged in.',
            type: 'success',
            buttons: [] // No buttons, it will auto-close
        });

        // Auto-close after 2 seconds (2000ms)
        setTimeout(() => {
            ModalManager.close();
        }, 2000);

        // Clean the URL (remove the ?login_success=... part)
        // This prevents the toast from reappearing on a page refresh
        if (window.history.pushState) {
            const newUrl = window.location.pathname;
            window.history.pushState({path: newUrl}, '', newUrl);
        }
    }
    // --- END: ADD THIS NEW BLOCK ---


    // --- ADD THESE TWO LINES TO START THE APP --- (These lines should already exist)
    const initialPage = window.location.hash.substring(1) || 'landing';    
    renderPage(initialPage);
    applyInitialTheme();
    // --- END OF FIX ---
});