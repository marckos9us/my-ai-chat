// Application State
const appState = {
    apiKey: null,
    currentChatId: null,
    chats: {},
    selectedModel: 'deepseek/deepseek-chat-v3-0324:free',
    fallbackModels: ['google/gemini-2.0-flash-exp:free', 'deepseek/deepseek-v3-base:free'],
    settings: {
        temperature: 1.0,
        topP: 1.0,
        topK: 0,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        repetitionPenalty: 1.0,
        minP: 0.0,
        topA: 0.0,
        seed: null,
        maxTokens: null,
        logprobs: false,
        topLogprobs: null,
        streaming: true,
        reasoning: {
            effort: null,
            maxTokens: null,
            exclude: false
        }
    },
    uploadedFiles: [],
    currentlyStreaming: false,
    streamController: null
};

// Model Information listed by context length
const models = [
    { label: 'Gemini 2.5 Pro Experimental (1,048,576 context)', value: 'google/gemini-2.5-pro-exp-03-25:free', context: 1048576 },
    { label: 'Gemini 2.0 Flash (1,048,576 context)', value: 'google/gemini-2.0-flash-exp:free', context: 1048576 },
    { label: 'Gemini 2.0 Flash Thinking Experimental 01-21 (1,048,576 context)', value: 'google/gemini-2.0-flash-thinking-exp:free', context: 1048576 },
    { label: 'DeepSeek V3 0324 (163,840 context)', value: 'deepseek/deepseek-chat-v3-0324:free', context: 163840 },
    { label: 'DeepSeek R1 (163,840 context)', value: 'deepseek/deepseek-r1:free', context: 163840 },
    { label: 'DeepSeek V3 Base (163,840 context)', value: 'deepseek/deepseek-v3-base:free', context: 163840 },
    { label: 'DeepSeek R1 Zero (163,840 context)', value: 'deepseek/deepseek-r1-zero:free', context: 163840 },
    { label: 'Gemma 3 27B (131,072 context)', value: 'google/gemma-3-27b-it:free', context: 131072 },
    { label: 'Qwen 2.5 VL 72B (131,072 context)', value: 'qwen/qwen2.5-vl-72b-instruct:free', context: 131072 },
    { label: 'Llama 3.2 1B (131,072 context)', value: 'meta-llama/llama-3.2-1b-instruct:free', context: 131072 },
    { label: 'DeepSeek R1 Distill Llama 70B (128,000 context)', value: 'deepseek/deepseek-r1-distill-llama-70b:free', context: 128000 }
];

// DOM Elements
const elements = {
    apiKeyModal: document.getElementById('apiKeyModal'),
    apiKeyInput: document.getElementById('apiKeyInput'),
    apiKeySubmit: document.getElementById('apiKeySubmit'),
    leavePageModal: document.getElementById('leavePageModal'),
    confirmLeavePage: document.getElementById('confirmLeavePage'),
    sidebar: document.getElementById('sidebar'),
    chatHistorySidebar: document.getElementById('chatHistorySidebar'),
    toggleSidebarBtn: document.getElementById('toggleSidebarBtn'),
    chatMessages: document.getElementById('chatMessages'),
    promptEditor: document.getElementById('promptEditor'),
    sendMessageBtn: document.getElementById('sendMessageBtn'),
    fileUploadBtn: document.getElementById('fileUploadBtn'),
    fileInput: document.getElementById('fileInput'),
    fileAttachments: document.getElementById('fileAttachments'),
    newChatBtn: document.getElementById('newChatBtn'),
    modelDropdown: document.getElementById('modelDropdown'),
    modelDropdownMenu: document.getElementById('modelDropdownMenu'),
    modelSettingsBtn: document.getElementById('modelSettingsBtn'),
    modelSettingsModal: document.getElementById('modelSettingsModal'),
    exportChatBtn: document.getElementById('exportChatBtn'),
    importChatBtn: document.getElementById('importChatBtn'),
    deleteChatBtn: document.getElementById('deleteChatBtn'),
    tokenCounter: document.getElementById('tokenCounter'),
    messageReceivedSound: document.getElementById('messageReceivedSound'),
    errorSound: document.getElementById('errorSound'),

    // Model settings elements
    temperatureSlider: document.getElementById('temperatureSlider'),
    temperatureValue: document.getElementById('temperatureValue'),
    topPSlider: document.getElementById('topPSlider'),
    topPValue: document.getElementById('topPValue'),
    topKSlider: document.getElementById('topKSlider'),
    topKValue: document.getElementById('topKValue'),
    frequencyPenaltySlider: document.getElementById('frequencyPenaltySlider'),
    frequencyPenaltyValue: document.getElementById('frequencyPenaltyValue'),
    presencePenaltySlider: document.getElementById('presencePenaltySlider'),
    presencePenaltyValue: document.getElementById('presencePenaltyValue'),
    repetitionPenaltySlider: document.getElementById('repetitionPenaltySlider'),
    repetitionPenaltyValue: document.getElementById('repetitionPenaltyValue'),
    minPSlider: document.getElementById('minPSlider'),
    minPValue: document.getElementById('minPValue'),
    topASlider: document.getElementById('topASlider'),
    topAValue: document.getElementById('topAValue'),
    seedInput: document.getElementById('seedInput'),
    maxTokensInput: document.getElementById('maxTokensInput'),
    logprobsCheckbox: document.getElementById('logprobsCheckbox'),
    topLogprobsInput: document.getElementById('topLogprobsInput'),
    streamingCheckbox: document.getElementById('streamingCheckbox'),
    reasoningEffortSelect: document.getElementById('reasoningEffortSelect'),
    reasoningTokensInput: document.getElementById('reasoningTokensInput'),
    excludeReasoningCheckbox: document.getElementById('excludeReasoningCheckbox'),
    resetSettingsBtn: document.getElementById('resetSettingsBtn')
};

// Bootstrap Modal Instances
let apiKeyModalInstance, modelSettingsModalInstance, leavePageModalInstance;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    // Initialize Bootstrap modals
    apiKeyModalInstance = new bootstrap.Modal(elements.apiKeyModal);
    modelSettingsModalInstance = new bootstrap.Modal(elements.modelSettingsModal);
    leavePageModalInstance = new bootstrap.Modal(elements.leavePageModal);

    // Initialize AOS animations
    AOS.init({
        duration: 800,
        once: true
    });

    // Check for API key in session storage
    const storedApiKey = sessionStorage.getItem('apiKey');
    if (storedApiKey) {
        appState.apiKey = storedApiKey;
        initializeAfterAuth();
    } else {
        apiKeyModalInstance.show();
    }

    // Initialize Event Listeners
    initEventListeners();

    // Initialize rich text editor
    initRichTextEditor();

    // Populate model dropdown
    populateModelDropdown();

    // Initialize settings sliders
    initializeSettingsUI();

    // Add MutationObserver to watch for content changes and auto-scroll
    setupMutationObserver();

    preloadSounds();

    // Add window resize handler to fix scrolling on resize
    window.addEventListener('resize', forceScrollToBottom);
});

function preloadSounds() {
    // Force preload of audio elements
    elements.messageReceivedSound.load();
    elements.errorSound.load();

    // Log sound status
    console.log('Preloading sounds:');
    console.log('- Success sound:', elements.messageReceivedSound.src);
    console.log('- Error sound:', elements.errorSound.src);

    // Add event listeners to verify loading
    elements.messageReceivedSound.addEventListener('canplaythrough', () => {
        console.log('Success sound loaded successfully');
    });

    elements.errorSound.addEventListener('canplaythrough', () => {
        console.log('Error sound loaded successfully');
    });
}

// Setup mutation observer for chat container
function setupMutationObserver() {
    // Create a mutation observer to detect changes in the chat container
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    const observer = new MutationObserver((mutations) => {
        // Scroll to bottom when content changes
        forceScrollToBottom();
    });

    // Observe changes to the chat messages container
    observer.observe(chatMessages, {
        childList: true,      // Watch for added/removed nodes
        subtree: true,        // Watch all descendants
        characterData: true,  // Watch for text changes
        attributes: false     // Don't watch attributes
    });

    console.log("Mutation observer setup for chat messages");
}

// Set up event listeners
function initEventListeners() {
    // API Key Modal
    elements.apiKeySubmit.addEventListener('click', handleApiKeySubmit);

    // Prevent leaving page without confirmation
    window.addEventListener('beforeunload', handleBeforeUnload);
    elements.confirmLeavePage.addEventListener('click', () => window.close());

    // Chat UI
    elements.toggleSidebarBtn.addEventListener('click', toggleSidebar);
    elements.promptEditor.addEventListener('keydown', handlePromptKeydown);
    elements.promptEditor.addEventListener('input', updateTokenCount);
    elements.sendMessageBtn.addEventListener('click', sendMessage);

    // File Upload - FIXED
    elements.fileUploadBtn.addEventListener('click', () => {
        elements.fileInput.click();
    });
    elements.fileInput.addEventListener('change', handleFileUpload);

    // Chat Management
    elements.newChatBtn.addEventListener('click', createNewChat);
    elements.exportChatBtn.addEventListener('click', exportChat);
    elements.importChatBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = handleImportChat;
        input.click();
    });
    elements.deleteChatBtn.addEventListener('click', deleteCurrentChat);

    // Model Settings
    elements.modelSettingsBtn.addEventListener('click', () => modelSettingsModalInstance.show());

    // Settings sliders and inputs
    elements.temperatureSlider.addEventListener('input', updateSettingValue);
    elements.topPSlider.addEventListener('input', updateSettingValue);
    elements.topKSlider.addEventListener('input', updateSettingValue);
    elements.frequencyPenaltySlider.addEventListener('input', updateSettingValue);
    elements.presencePenaltySlider.addEventListener('input', updateSettingValue);
    elements.repetitionPenaltySlider.addEventListener('input', updateSettingValue);
    elements.minPSlider.addEventListener('input', updateSettingValue);
    elements.topASlider.addEventListener('input', updateSettingValue);
    elements.resetSettingsBtn.addEventListener('click', resetSettings);

    // Settings modal save
    elements.modelSettingsModal.addEventListener('hidden.bs.modal', saveModelSettings);

    // Add logging for debugging
    console.log("Event listeners initialized");
    console.log("File input element:", elements.fileInput);
}

// Initialize the rich text editor
function initRichTextEditor() {
    // Improved key handling
    elements.promptEditor.addEventListener('keydown', (e) => {
        // Tab key handling
        if (e.key === 'Tab') {
            e.preventDefault();
            document.execCommand('insertText', false, '    ');
        }

        // Handle Ctrl+Enter to send message
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            sendMessage();
            return;
        }

        // Improved arrow key scrolling for Up/Down
        if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && isPromptEditorScrollable()) {
            const lineHeight = parseInt(getComputedStyle(elements.promptEditor).lineHeight);
            const scrollAmount = e.key === 'ArrowUp' ? -lineHeight : lineHeight;

            // Only prevent default if we're not at the boundary
            if (e.key === 'ArrowUp' && elements.promptEditor.scrollTop > 0) {
                e.preventDefault();
                elements.promptEditor.scrollTop += scrollAmount;
            } else if (e.key === 'ArrowDown' &&
                elements.promptEditor.scrollTop + elements.promptEditor.clientHeight <
                elements.promptEditor.scrollHeight) {
                e.preventDefault();
                elements.promptEditor.scrollTop += scrollAmount;
            }
        }
    });

    // Optimize input event handling with debounce
    elements.promptEditor.addEventListener('input', debounce(updateTokenCount, 300));

    // Add scroll optimization
    optimizePromptEditorScrolling();
}

// Helper function to check if prompt editor needs scrolling
function isPromptEditorScrollable() {
    return elements.promptEditor.scrollHeight > elements.promptEditor.clientHeight;
}

// Debounce function to limit how often a function is called
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Optimize scrolling for the prompt editor
function optimizePromptEditorScrolling() {
    // Add passive scrolling for better performance
    elements.promptEditor.addEventListener('scroll', () => { }, { passive: true });

    // Add hardware acceleration to improve scrolling performance
    elements.promptEditor.style.transform = 'translateZ(0)';
    elements.promptEditor.style.willChange = 'transform';

    // Adjust scroll behavior for smoother experience
    elements.promptEditor.style.scrollBehavior = 'auto';

    // Add scroll optimization for long content
    elements.promptEditor.addEventListener('input', (e) => {
        // If content is getting large, apply performance optimizations
        if (e.target.innerText.length > 5000) {
            // Temporarily reduce rendering quality during input
            e.target.style.willChange = 'contents';

            // Reset after input stops
            clearTimeout(e.target.resetTimer);
            e.target.resetTimer = setTimeout(() => {
                e.target.style.willChange = 'transform';
            }, 1000);
        }
    });
}

// Rough token count estimation
function updateTokenCount() {
    const text = elements.promptEditor.innerText;
    // Very rough estimation: 1 token is about 4 characters for English text
    const tokenEstimate = Math.ceil(text.length / 4);
    elements.tokenCounter.textContent = `~${tokenEstimate} tokens`;
}

// Initialize settings UI with current values
function initializeSettingsUI() {
    elements.temperatureValue.textContent = appState.settings.temperature.toFixed(1);
    elements.temperatureSlider.value = appState.settings.temperature;

    elements.topPValue.textContent = appState.settings.topP.toFixed(2);
    elements.topPSlider.value = appState.settings.topP;

    elements.topKValue.textContent = appState.settings.topK;
    elements.topKSlider.value = appState.settings.topK;

    elements.frequencyPenaltyValue.textContent = appState.settings.frequencyPenalty.toFixed(1);
    elements.frequencyPenaltySlider.value = appState.settings.frequencyPenalty;

    elements.presencePenaltyValue.textContent = appState.settings.presencePenalty.toFixed(1);
    elements.presencePenaltySlider.value = appState.settings.presencePenalty;

    elements.repetitionPenaltyValue.textContent = appState.settings.repetitionPenalty.toFixed(1);
    elements.repetitionPenaltySlider.value = appState.settings.repetitionPenalty;

    elements.minPValue.textContent = appState.settings.minP.toFixed(2);
    elements.minPSlider.value = appState.settings.minP;

    elements.topAValue.textContent = appState.settings.topA.toFixed(2);
    elements.topASlider.value = appState.settings.topA;

    elements.seedInput.value = appState.settings.seed || '';
    elements.maxTokensInput.value = appState.settings.maxTokens || '';

    elements.logprobsCheckbox.checked = appState.settings.logprobs;
    elements.topLogprobsInput.value = appState.settings.topLogprobs || '';

    elements.streamingCheckbox.checked = appState.settings.streaming;

    elements.reasoningEffortSelect.value = appState.settings.reasoning.effort || '';
    elements.reasoningTokensInput.value = appState.settings.reasoning.maxTokens || '';
    elements.excludeReasoningCheckbox.checked = appState.settings.reasoning.exclude;
}

// Update setting value display when sliders change
function updateSettingValue(e) {
    const element = e.target;
    const value = parseFloat(element.value);

    switch (element.id) {
        case 'temperatureSlider':
            elements.temperatureValue.textContent = value.toFixed(1);
            break;
        case 'topPSlider':
            elements.topPValue.textContent = value.toFixed(2);
            break;
        case 'topKSlider':
            elements.topKValue.textContent = value;
            break;
        case 'frequencyPenaltySlider':
            elements.frequencyPenaltyValue.textContent = value.toFixed(1);
            break;
        case 'presencePenaltySlider':
            elements.presencePenaltyValue.textContent = value.toFixed(1);
            break;
        case 'repetitionPenaltySlider':
            elements.repetitionPenaltyValue.textContent = value.toFixed(1);
            break;
        case 'minPSlider':
            elements.minPValue.textContent = value.toFixed(2);
            break;
        case 'topASlider':
            elements.topAValue.textContent = value.toFixed(2);
            break;
    }
}

// Reset settings to default values
function resetSettings() {
    appState.settings = {
        temperature: 1.0,
        topP: 1.0,
        topK: 0,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        repetitionPenalty: 1.0,
        minP: 0.0,
        topA: 0.0,
        seed: null,
        maxTokens: null,
        logprobs: false,
        topLogprobs: null,
        streaming: true,
        reasoning: {
            effort: null,
            maxTokens: null,
            exclude: false
        }
    };

    initializeSettingsUI();
}

// Save model settings from UI to application state
function saveModelSettings() {
    appState.settings.temperature = parseFloat(elements.temperatureSlider.value);
    appState.settings.topP = parseFloat(elements.topPSlider.value);
    appState.settings.topK = parseInt(elements.topKSlider.value);
    appState.settings.frequencyPenalty = parseFloat(elements.frequencyPenaltySlider.value);
    appState.settings.presencePenalty = parseFloat(elements.presencePenaltySlider.value);
    appState.settings.repetitionPenalty = parseFloat(elements.repetitionPenaltySlider.value);
    appState.settings.minP = parseFloat(elements.minPSlider.value);
    appState.settings.topA = parseFloat(elements.topASlider.value);

    const seedValue = elements.seedInput.value.trim();
    appState.settings.seed = seedValue ? parseInt(seedValue) : null;

    const maxTokensValue = elements.maxTokensInput.value.trim();
    appState.settings.maxTokens = maxTokensValue ? parseInt(maxTokensValue) : null;

    appState.settings.logprobs = elements.logprobsCheckbox.checked;

    const topLogprobsValue = elements.topLogprobsInput.value.trim();
    appState.settings.topLogprobs = topLogprobsValue ? parseInt(topLogprobsValue) : null;

    appState.settings.streaming = elements.streamingCheckbox.checked;

    // Reasoning settings
    appState.settings.reasoning.effort = elements.reasoningEffortSelect.value || null;

    const reasoningTokensValue = elements.reasoningTokensInput.value.trim();
    appState.settings.reasoning.maxTokens = reasoningTokensValue ? parseInt(reasoningTokensValue) : null;

    appState.settings.reasoning.exclude = elements.excludeReasoningCheckbox.checked;

    // Save settings to localStorage
    saveAppState();
}

// Handle API key submission
function handleApiKeySubmit() {
    const apiKey = elements.apiKeyInput.value.trim();
    if (apiKey) {
        appState.apiKey = apiKey;
        sessionStorage.setItem('apiKey', apiKey);
        apiKeyModalInstance.hide();
        initializeAfterAuth();
    }
}

// Initialize app after authentication
function initializeAfterAuth() {
    // Load app state from localStorage
    loadAppState();

    // Create a new chat if none exists
    if (Object.keys(appState.chats).length === 0) {
        createNewChat();
    } else {
        // Load the most recent chat
        const chatIds = Object.keys(appState.chats);
        const lastChatId = chatIds[chatIds.length - 1];
        loadChat(lastChatId);
    }

    // Update chat history sidebar
    updateChatHistorySidebar();
}

// Load app state from localStorage
function loadAppState() {
    const savedState = localStorage.getItem('llmChatAppState');
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        appState.chats = parsedState.chats || {};
        appState.selectedModel = parsedState.selectedModel || 'google/gemini-2.0-flash-thinking-exp:free';
        appState.settings = parsedState.settings || appState.settings;

        // Update UI elements to reflect loaded state
        updateModelDropdown();
        initializeSettingsUI();
    }
}

// Save app state to localStorage
function saveAppState() {
    const stateToSave = {
        chats: appState.chats,
        selectedModel: appState.selectedModel,
        settings: appState.settings
    };
    localStorage.setItem('llmChatAppState', JSON.stringify(stateToSave));
}

// Populate the model dropdown with available models
function populateModelDropdown() {
    elements.modelDropdownMenu.innerHTML = '';

    models.forEach(model => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.classList.add('dropdown-item');
        a.href = '#';
        a.textContent = model.label;
        a.dataset.value = model.value;

        if (model.value === appState.selectedModel) {
            a.classList.add('active');
            elements.modelDropdown.textContent = model.label;
        }

        a.addEventListener('click', (e) => {
            e.preventDefault();
            changeModel(model.value, model.label);
        });

        li.appendChild(a);
        elements.modelDropdownMenu.appendChild(li);
    });
}

// Update the model dropdown to reflect the current selection
function updateModelDropdown() {
    // Find the model object that matches the selected model
    const selectedModelObj = models.find(model => model.value === appState.selectedModel);
    if (selectedModelObj) {
        elements.modelDropdown.textContent = selectedModelObj.label;

        // Update the active state in the dropdown
        const dropdownItems = elements.modelDropdownMenu.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            if (item.dataset.value === appState.selectedModel) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
}

// Change the selected model
function changeModel(modelValue, modelLabel) {
    appState.selectedModel = modelValue;
    elements.modelDropdown.textContent = modelLabel;

    // Update the active state in the dropdown
    const dropdownItems = elements.modelDropdownMenu.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        if (item.dataset.value === modelValue) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Create a new chat when model changes
    createNewChat();

    // Save state
    saveAppState();
}

// Toggle sidebar visibility
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');

    if (sidebar.classList.contains('d-md-block')) {
        // Hide sidebar
        sidebar.classList.remove('d-md-block');
        sidebar.classList.add('d-none');

        // Expand main content
        mainContent.classList.add('expanded');
        mainContent.classList.remove('col-md-9', 'col-lg-10');
        mainContent.classList.add('col-12');
    } else {
        // Show sidebar
        sidebar.classList.add('d-md-block');
        sidebar.classList.remove('d-none');

        // Restore main content
        mainContent.classList.remove('expanded');
        mainContent.classList.remove('col-12');
        mainContent.classList.add('col-md-9', 'col-lg-10');
    }

    // Force reflow
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        forceScrollToBottom();
    }, 10);
}

// Create a new chat
function createNewChat() {
    // Generate a new chat ID
    const chatId = 'chat_' + Date.now();

    // Create new chat object
    appState.chats[chatId] = {
        id: chatId,
        title: 'New Conversation',
        model: appState.selectedModel,
        messages: [],
        createdAt: new Date().toISOString()
    };

    // Set as current chat
    appState.currentChatId = chatId;

    // Clear chat messages display
    elements.chatMessages.innerHTML = '';

    // Clear prompt editor
    elements.promptEditor.innerHTML = '';

    // Clear uploaded files
    clearUploadedFiles();

    // Update chat history sidebar
    updateChatHistorySidebar();

    // Save state
    saveAppState();

    // Add system message to the UI
    const systemMessageElement = document.createElement('div');
    systemMessageElement.className = 'system-message';
    systemMessageElement.textContent = `New conversation started with ${getModelLabel(appState.selectedModel)}`;
    elements.chatMessages.appendChild(systemMessageElement);
}

// Get model label from model value
function getModelLabel(modelValue) {
    const model = models.find(m => m.value === modelValue);
    return model ? model.label : modelValue;
}

// Update the chat history sidebar with current chats
function updateChatHistorySidebar() {
    elements.chatHistorySidebar.innerHTML = '';

    // Sort chats by creation date (newest first)
    const sortedChatIds = Object.keys(appState.chats).sort((a, b) => {
        return new Date(appState.chats[b].createdAt) - new Date(appState.chats[a].createdAt);
    });

    sortedChatIds.forEach(chatId => {
        const chat = appState.chats[chatId];
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-history-item';
        chatItem.dataset.chatId = chatId;

        if (chatId === appState.currentChatId) {
            chatItem.classList.add('active');
        }

        // Use the first user message as the title, or fallback to default title
        let chatTitle = chat.title;
        if (chat.messages.length > 0) {
            const firstUserMessage = chat.messages.find(msg => msg.role === 'user');
            if (firstUserMessage) {
                chatTitle = firstUserMessage.content.split('\n')[0].substring(0, 30);
                if (firstUserMessage.content.length > 30) chatTitle += '...';
            }
        }

        chatItem.textContent = chatTitle;

        // Add timestamp tooltip
        const createdDate = new Date(chat.createdAt);
        const formattedDate = createdDate.toLocaleString();
        chatItem.title = formattedDate;

        chatItem.addEventListener('click', () => {
            loadChat(chatId);
        });

        elements.chatHistorySidebar.appendChild(chatItem);
    });
}

// Load a specific chat
function loadChat(chatId) {
    if (!appState.chats[chatId]) return;

    // Set current chat
    appState.currentChatId = chatId;

    // Update active state in sidebar
    const chatItems = document.querySelectorAll('.chat-history-item');
    chatItems.forEach(item => {
        if (item.dataset.chatId === chatId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Clear chat messages display
    elements.chatMessages.innerHTML = '';

    // Clear prompt editor
    elements.promptEditor.innerHTML = '';

    // Clear uploaded files
    clearUploadedFiles();

    // Add system message about loaded chat
    const chat = appState.chats[chatId];
    const systemMessageElement = document.createElement('div');
    systemMessageElement.className = 'system-message';
    systemMessageElement.textContent = `Loaded conversation with ${getModelLabel(chat.model)}`;
    elements.chatMessages.appendChild(systemMessageElement);

    // Render messages
    chat.messages.forEach(message => {
        renderMessage(message);
    });

    // Scroll to bottom
    scrollToBottom();
}

// Handle file upload
function handleFileUpload(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Disable prompt editor during file processing
    elements.promptEditor.contentEditable = "false";

    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'file-loading-indicator';
    loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading file...';
    elements.fileAttachments.appendChild(loadingIndicator);

    // Process each file
    let filesProcessed = 0;
    Array.from(files).forEach(file => {
        if (isTextFile(file)) {
            const reader = new FileReader();

            reader.onload = function (event) {
                const fileContent = event.target.result;

                // Format the file content with header
                const formattedContent = `\n\nFile: ${file.name}\n${'='.repeat(file.name.length + 6)}\n${fileContent}\n${'='.repeat(file.name.length + 6)}\n\n`;

                // Insert directly into the prompt editor
                elements.promptEditor.innerHTML += formattedContent.replace(/\n/g, '<br>');

                // Update tracking
                filesProcessed++;

                // If all files processed, re-enable editor and remove loading indicator
                if (filesProcessed === files.length) {
                    elements.promptEditor.contentEditable = "true";
                    if (loadingIndicator.parentNode) {
                        loadingIndicator.parentNode.removeChild(loadingIndicator);
                    }
                    // Focus editor at the end
                    placeCursorAtEnd(elements.promptEditor);
                    // Update token count
                    updateTokenCount();
                }
            };

            reader.onerror = function (event) {
                console.error("File read error:", event.target.error);
                alert(`Error reading file: ${file.name}`);

                // Update tracking
                filesProcessed++;
                if (filesProcessed === files.length) {
                    elements.promptEditor.contentEditable = "true";
                    if (loadingIndicator.parentNode) {
                        loadingIndicator.parentNode.removeChild(loadingIndicator);
                    }
                }
            };

            // Read the file as text
            reader.readAsText(file);
        } else {
            // For non-text files
            alert(`File type not supported: ${file.type}`);
            filesProcessed++;
            if (filesProcessed === files.length) {
                elements.promptEditor.contentEditable = "true";
                if (loadingIndicator.parentNode) {
                    loadingIndicator.parentNode.removeChild(loadingIndicator);
                }
            }
        }
    });
}

// Check if a file is text-based
function isTextFile(file) {
    // List of text-based MIME types
    const textTypes = [
        'text/',
        'application/json',
        'application/javascript',
        'application/xml',
        'application/xhtml+xml',
        'application/x-sh',
        'application/x-javascript',
        'application/x-httpd-php',
        'application/x-python',
        'application/x-ruby',
        'application/csv'
    ];

    // Check file extension for common text-based files
    const textExtensions = [
        '.txt', '.md', '.js', '.html', '.css', '.py', '.sh', '.json', '.csv',
        '.xml', '.yml', '.yaml', '.toml', '.ini', '.cfg', '.conf', '.c', '.cpp',
        '.h', '.java', '.php', '.rb', '.pl', '.sql', '.ts', '.jsx', '.tsx'
    ];

    // Check MIME type
    const isTextMime = textTypes.some(type => file.type.startsWith(type));

    // Check extension
    const fileName = file.name.toLowerCase();
    const isTextExt = textExtensions.some(ext => fileName.endsWith(ext));

    return isTextMime || isTextExt;
}

// Add file attachment UI element
function addFileAttachment(fileName) {
    const fileAttachment = document.createElement('div');
    fileAttachment.className = 'file-attachment';
    fileAttachment.dataset.fileName = fileName;

    const fileIcon = document.createElement('i');
    fileIcon.className = 'fas fa-file';

    const fileNameSpan = document.createElement('span');
    fileNameSpan.className = 'file-name';
    fileNameSpan.textContent = fileName;

    const removeButton = document.createElement('i');
    removeButton.className = 'fas fa-times remove-file';
    removeButton.addEventListener('click', () => removeFileAttachment(fileName));

    fileAttachment.appendChild(fileIcon);
    fileAttachment.appendChild(fileNameSpan);
    fileAttachment.appendChild(removeButton);

    elements.fileAttachments.appendChild(fileAttachment);

    // Log for debugging
    console.log(`File attachment UI added for ${fileName}`);
    console.log(`Current file attachments: ${document.querySelectorAll('.file-attachment').length}`);
}

// Remove file attachment
function removeFileAttachment(fileName) {
    // Remove from the UI
    const fileAttachment = document.querySelector(`.file-attachment[data-file-name="${fileName}"]`);
    if (fileAttachment) {
        fileAttachment.remove();
    }

    // Remove from state
    appState.uploadedFiles = appState.uploadedFiles.filter(file => file.name !== fileName);

    // Update token count
    updateTokenCount();
}

// Clear all uploaded files
function clearUploadedFiles() {
    // Clear from UI
    elements.fileAttachments.innerHTML = '';

    // Clear from state
    appState.uploadedFiles = [];

    // Update token count
    updateTokenCount();
}

// Format file contents for prompt - Improved version
function formatFileContents() {
    if (appState.uploadedFiles.length === 0) return '';

    let formattedContent = '--- File Attachments ---\n\n';

    appState.uploadedFiles.forEach((file, index) => {
        formattedContent += `FILE ${index + 1}: ${file.name}\n${'='.repeat(20)}\n${file.content}\n${'='.repeat(20)}\n\n`;
    });

    formattedContent += '--- End of File Attachments ---\n\n';
    return formattedContent;
}

// Send message to the API
async function sendMessage() {
    // Get message content
    const promptText = elements.promptEditor.innerText.trim();

    // Check if prompt is empty
    if (promptText === '') return;

    // Create message object
    const userMessage = {
        role: 'user',
        content: promptText,
        timestamp: new Date().toISOString()
    };

    // Store message in current chat
    appState.chats[appState.currentChatId].messages.push(userMessage);

    // Render user message
    renderMessage(userMessage);

    // Clear prompt editor
    elements.promptEditor.innerHTML = '';

    // Show waiting indicator
    const waitingIndicator = addWaitingIndicator();

    // Call API with current messages
    callApi(waitingIndicator);
}

// Add waiting indicator to the chat
function addWaitingIndicator() {
    const waitingIndicator = document.createElement('div');
    waitingIndicator.className = 'waiting-indicator';
    waitingIndicator.innerHTML = `
        <div class="typing-indicator me-2">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>
        <span>Waiting for response...</span>
    `;
    elements.chatMessages.appendChild(waitingIndicator);

    // Scroll to make indicator visible
    scrollToBottom();

    return waitingIndicator;
}

// Render a message in the chat
function renderMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = `chat-bubble ${message.role === 'user' ? 'user-bubble' : 'assistant-bubble'}`;
    messageElement.dataset.messageId = message.timestamp;
    messageElement.setAttribute('data-aos', 'fade-up');

    // Message content
    let contentHTML = '';

    if (message.role === 'user') {
        // User bubble with actions
        contentHTML = `
            <div class="bubble-actions">
                <button class="btn btn-sm btn-outline-secondary copy-btn" title="Copy message">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary edit-btn" title="Edit message">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
            <div class="message-content">${message.content.replace(/\n/g, '<br>')}</div>
            <div class="bubble-metadata">
                <div>${new Date(message.timestamp).toLocaleTimeString()}</div>
            </div>
        `;
    } else {
        // Assistant bubble with actions and markdown content
        contentHTML = `
            <div class="bubble-actions">
                <button class="btn btn-sm btn-outline-secondary copy-btn" title="Copy message">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary regenerate-btn" title="Regenerate response">
                    <i class="fas fa-redo-alt"></i>
                </button>
            </div>
            <div class="markdown-content">${marked.parse(message.content || '')}</div>
            <div class="bubble-metadata">
                <div>Model: ${getModelLabel(message.model || appState.selectedModel)}</div>
                ${message.processingTime ? `<div>Time: ${message.processingTime.toFixed(2)}s</div>` : ''}
                ${message.usage?.total_tokens ? `<div>Tokens: ${message.usage.total_tokens}</div>` : ''}
                <div>${new Date(message.timestamp).toLocaleTimeString()}</div>
            </div>
        `;
    }

    messageElement.innerHTML = contentHTML;

    // Add to chat
    elements.chatMessages.appendChild(messageElement);

    // Apply syntax highlighting to code blocks
    if (message.role === 'assistant') {
        messageElement.querySelectorAll('pre code').forEach(block => {
            hljs.highlightElement(block);
        });
    }

    // Add event listeners to action buttons
    const copyBtn = messageElement.querySelector('.copy-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyMessageContent(message.content);
            copyBtn.classList.add('copy-feedback');
            setTimeout(() => copyBtn.classList.remove('copy-feedback'), 300);
        });
    }

    if (message.role === 'user') {
        const editBtn = messageElement.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                editUserMessage(messageElement, message);
            });
        }
    } else {
        const regenerateBtn = messageElement.querySelector('.regenerate-btn');
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', () => {
                regenerateResponse(message);
            });
        }
    }

    // Scroll to bottom
    scrollToBottom();

    return messageElement;
}

// Copy message content to clipboard
function copyMessageContent(content) {
    navigator.clipboard.writeText(content)
        .then(() => {
            // Show toast or notification (optional)
            console.log('Content copied to clipboard');
        })
        .catch(err => {
            console.error('Failed to copy content:', err);
        });
}

// Edit a user message
function editUserMessage(messageElement, message) {
    // Toggle edit mode
    messageElement.classList.add('edit-mode');

    // Replace content with editable area
    const contentElement = messageElement.querySelector('.message-content');
    const originalContent = message.content;

    // Create editable content area
    contentElement.innerHTML = `
        <div contenteditable="true" class="edit-content promptEditor">${originalContent.replace(/\n/g, '<br>')}</div>
        <div class="edit-actions">
            <button class="btn btn-sm btn-outline-secondary cancel-edit-btn">Cancel</button>
            <button class="btn btn-sm btn-primary save-edit-btn">Save & Regenerate</button>
        </div>
    `;

    // Focus editable area
    const editableArea = contentElement.querySelector('.edit-content');
    editableArea.focus();

    // Add event listeners to edit buttons
    const cancelBtn = contentElement.querySelector('.cancel-edit-btn');
    const saveBtn = contentElement.querySelector('.save-edit-btn');

    cancelBtn.addEventListener('click', () => {
        // Cancel edit and restore original content
        messageElement.classList.remove('edit-mode');
        contentElement.innerHTML = originalContent.replace(/\n/g, '<br>');
    });

    saveBtn.addEventListener('click', () => {
        // Get edited content
        const editedContent = editableArea.innerText.trim();

        // Exit edit mode
        messageElement.classList.remove('edit-mode');
        contentElement.innerHTML = editedContent.replace(/\n/g, '<br>');

        // Update message in state
        message.content = editedContent;
        message.timestamp = new Date().toISOString();

        // Update timestamp display
        const metadataElement = messageElement.querySelector('.bubble-metadata');
        metadataElement.innerHTML = `
            <div>${new Date(message.timestamp).toLocaleTimeString()}</div>
        `;

        // Find and remove all subsequent messages
        const currentChat = appState.chats[appState.currentChatId];
        const messageIndex = currentChat.messages.findIndex(msg => msg.timestamp === message.timestamp);

        if (messageIndex !== -1) {
            // Remove subsequent messages from state
            currentChat.messages.splice(messageIndex + 1);

            // Remove subsequent message elements from UI
            const allMessageElements = Array.from(elements.chatMessages.querySelectorAll('.chat-bubble'));
            const currentIndex = allMessageElements.indexOf(messageElement);

            allMessageElements.slice(currentIndex + 1).forEach(element => {
                element.remove();
            });

            // Generate a new response by calling the API
            const waitingIndicator = addWaitingIndicator();
            callApi(waitingIndicator);
        }
    });
}

// Regenerate a response
function regenerateResponse(afterMessage) {
    // Find message in current chat
    const currentChat = appState.chats[appState.currentChatId];
    const messageIndex = currentChat.messages.findIndex(msg => msg.timestamp === afterMessage.timestamp);

    if (messageIndex !== -1) {
        // Find the last user message before this response
        let lastUserMessageIndex = messageIndex - 1;
        while (lastUserMessageIndex >= 0 && currentChat.messages[lastUserMessageIndex].role !== 'user') {
            lastUserMessageIndex--;
        }

        if (lastUserMessageIndex >= 0) {
            // Remove all messages after the last user message (including the current assistant message)
            currentChat.messages = currentChat.messages.slice(0, lastUserMessageIndex + 1);

            // Remove corresponding message elements from UI
            const allMessageElements = Array.from(elements.chatMessages.querySelectorAll('.chat-bubble'));

            // Keep only up to the last user message
            for (let i = messageIndex; i < allMessageElements.length; i++) {
                allMessageElements[i].remove();
            }

            // Show waiting indicator
            const waitingIndicator = addWaitingIndicator();

            // Generate a new response by calling the API with the existing messages
            callApi(waitingIndicator);
        }
    }
}

// Call the API with current messages
async function callApi(waitingIndicator) {
    try {
        // Cancel any ongoing streams
        if (appState.currentlyStreaming && appState.streamController) {
            appState.streamController.abort();
        }

        // Create messages array for API call from the current chat
        const messages = appState.chats[appState.currentChatId].messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        // Create API request payload
        const requestPayload = {
            model: appState.selectedModel,
            models: appState.fallbackModels,
            messages: messages,
            stream: appState.settings.streaming
        };

        // Add optional parameters if they are set
        if (appState.settings.temperature !== 1.0) requestPayload.temperature = appState.settings.temperature;
        if (appState.settings.topP !== 1.0) requestPayload.top_p = appState.settings.topP;
        if (appState.settings.topK !== 0) requestPayload.top_k = appState.settings.topK;
        if (appState.settings.frequencyPenalty !== 0.0) requestPayload.frequency_penalty = appState.settings.frequencyPenalty;
        if (appState.settings.presencePenalty !== 0.0) requestPayload.presence_penalty = appState.settings.presencePenalty;
        if (appState.settings.repetitionPenalty !== 1.0) requestPayload.repetition_penalty = appState.settings.repetitionPenalty;
        if (appState.settings.minP !== 0.0) requestPayload.min_p = appState.settings.minP;
        if (appState.settings.topA !== 0.0) requestPayload.top_a = appState.settings.topA;
        if (appState.settings.seed !== null) requestPayload.seed = appState.settings.seed;
        if (appState.settings.maxTokens !== null) requestPayload.max_tokens = appState.settings.maxTokens;
        if (appState.settings.logprobs) requestPayload.logprobs = true;
        if (appState.settings.topLogprobs !== null) requestPayload.top_logprobs = appState.settings.topLogprobs;

        // Add reasoning settings if any are set
        if (appState.settings.reasoning.effort || appState.settings.reasoning.maxTokens || appState.settings.reasoning.exclude) {
            requestPayload.reasoning = {};
            if (appState.settings.reasoning.effort) requestPayload.reasoning.effort = appState.settings.reasoning.effort;
            if (appState.settings.reasoning.maxTokens) requestPayload.reasoning.max_tokens = appState.settings.reasoning.maxTokens;
            if (appState.settings.reasoning.exclude) requestPayload.reasoning.exclude = true;
        }

        console.log("Sending API request with payload:", requestPayload);

        // Set up abort controller for streaming
        appState.streamController = new AbortController();
        const signal = appState.streamController.signal;

        // Send to API
        const startTime = Date.now();

        if (appState.settings.streaming) {
            // Streaming response
            appState.currentlyStreaming = true;

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${appState.apiKey}`
                },
                body: JSON.stringify(requestPayload),
                signal: signal
            });

            // Check for HTTP errors
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `HTTP error: ${response.status}`);
            }

            // Create assistant message placeholder
            const assistantMessage = {
                role: 'assistant',
                content: '',
                model: appState.selectedModel,
                timestamp: new Date().toISOString(),
                processingTime: 0,
                usage: {}
            };

            // Remove waiting indicator
            if (waitingIndicator && waitingIndicator.parentNode) {
                waitingIndicator.parentNode.removeChild(waitingIndicator);
            }

            // Add message to chat state
            appState.chats[appState.currentChatId].messages.push(assistantMessage);

            // Render initial empty message bubble
            const messageBubble = renderMessage(assistantMessage);
            const contentElement = messageBubble.querySelector('.markdown-content');

            // Process the stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        // End of stream
                        break;
                    }

                    // Decode chunk and add to buffer
                    buffer += decoder.decode(value, { stream: true });

                    // Process complete lines from buffer
                    let lines = buffer.split('\n');
                    buffer = lines.pop() || ''; // Keep the last incomplete line in buffer

                    for (const line of lines) {
                        const trimmedLine = line.trim();
                        if (!trimmedLine || trimmedLine === 'data: [DONE]' || trimmedLine.startsWith(':')) {
                            continue; // Skip empty lines, end markers, and comments
                        }

                        if (trimmedLine.startsWith('data: ')) {
                            const data = trimmedLine.slice(6);
                            try {
                                const parsedData = JSON.parse(data);

                                // Extract content delta
                                const contentDelta = parsedData.choices[0]?.delta?.content;
                                if (contentDelta) {
                                    // Update the message content
                                    assistantMessage.content += contentDelta;

                                    // Update the displayed content
                                    contentElement.innerHTML = marked.parse(assistantMessage.content);

                                    // Apply syntax highlighting
                                    contentElement.querySelectorAll('pre code').forEach(block => {
                                        hljs.highlightElement(block);
                                    });

                                    // Scroll to bottom every few characters
                                    if (assistantMessage.content.length % 5 === 0) {
                                        forceScrollToBottom();
                                    }
                                }

                                // Check for finish reason
                                if (parsedData.choices[0]?.finish_reason) {
                                    assistantMessage.finish_reason = parsedData.choices[0].finish_reason;
                                }

                                // Check for usage info in the final chunk
                                if (parsedData.usage) {
                                    assistantMessage.usage = parsedData.usage;

                                    // Update bubble metadata with usage info
                                    const metadataElement = messageBubble.querySelector('.bubble-metadata');
                                    if (metadataElement) {
                                        const endTime = Date.now();
                                        const processingTime = (endTime - startTime) / 1000; // in seconds
                                        assistantMessage.processingTime = processingTime;

                                        metadataElement.innerHTML = `
                                            <div>Model: ${getModelLabel(assistantMessage.model)}</div>
                                            <div>Time: ${processingTime.toFixed(2)}s</div>
                                            <div>Tokens: ${assistantMessage.usage.total_tokens || 'N/A'}</div>
                                            <div>${new Date(assistantMessage.timestamp).toLocaleTimeString()}</div>
                                        `;
                                    }
                                }
                            } catch (e) {
                                console.error('Error parsing stream data:', e);
                            }
                        }
                    }
                }

                // Final scroll to bottom
                forceScrollToBottom();

                // Play completion sound
                playSoundSafely(elements.messageReceivedSound);

            } catch (streamError) {
                if (streamError.name === 'AbortError') {
                    console.log('Stream cancelled');
                } else {
                    throw streamError;
                }
            } finally {
                appState.currentlyStreaming = false;
            }

        } else {
            // Non-streaming response
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${appState.apiKey}`
                },
                body: JSON.stringify(requestPayload)
            });

            // Check for HTTP errors
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `HTTP error: ${response.status}`);
            }

            const responseData = await response.json();

            // Create assistant message
            const assistantMessage = {
                role: 'assistant',
                content: responseData.choices[0]?.message?.content || '',
                model: responseData.model || appState.selectedModel,
                timestamp: new Date().toISOString(),
                processingTime: (Date.now() - startTime) / 1000, // in seconds
                usage: responseData.usage || {}
            };

            // Remove waiting indicator
            if (waitingIndicator && waitingIndicator.parentNode) {
                waitingIndicator.parentNode.removeChild(waitingIndicator);
            }

            // Add message to chat state
            appState.chats[appState.currentChatId].messages.push(assistantMessage);

            // Render message
            renderMessage(assistantMessage);

            // Final scroll to bottom
            forceScrollToBottom();

            // Play completion sound
            elements.messageReceivedSound.play();
        }

        // Save app state
        saveAppState();

        // Update chat history sidebar to show the first message as title
        updateChatHistorySidebar();

    } catch (error) {
        console.error('API Error:', error);

        // Remove waiting indicator
        if (waitingIndicator && waitingIndicator.parentNode) {
            waitingIndicator.parentNode.removeChild(waitingIndicator);
        }

        // Display error message
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <i class="fas fa-exclamation-circle me-2"></i>
                    <strong>Error:</strong> ${error.message || 'Something went wrong'}
                </div>
                <button class="btn btn-sm btn-danger retry-btn">
                    <i class="fas fa-redo-alt me-1"></i> Retry
                </button>
            </div>
        `;
        elements.chatMessages.appendChild(errorElement);

        // Add event listener to the retry button
        const retryBtn = errorElement.querySelector('.retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                // Remove the error message
                if (errorElement.parentNode) {
                    errorElement.parentNode.removeChild(errorElement);
                }

                // Create a new waiting indicator
                const newWaitingIndicator = addWaitingIndicator();

                // Retry the API call
                callApi(newWaitingIndicator);
            });
        }

        // Play error sound
        playSoundSafely(elements.errorSound);

        // Scroll to bottom
        forceScrollToBottom();
    }
}

// Handle keyboard shortcuts in the prompt input
function handlePromptKeydown(event) {
    // Ctrl+Enter to send message
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        sendMessage();
    }
}

// Export current chat to a JSON file
function exportChat() {
    if (!appState.currentChatId) return;

    const currentChat = appState.chats[appState.currentChatId];
    const chatData = JSON.stringify(currentChat, null, 2);

    // Create blob and download link
    const blob = new Blob([chatData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `chat_export_${new Date().toISOString().replace(/:/g, '-')}.json`;
    document.body.appendChild(downloadLink);
    downloadLink.click();

    // Clean up
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
}

// Handle chat import from file
function handleImportChat(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedChat = JSON.parse(e.target.result);

            // Validate the imported chat structure
            if (!importedChat.id || !importedChat.messages || !Array.isArray(importedChat.messages)) {
                throw new Error('Invalid chat format');
            }

            // Generate a new ID to avoid conflicts
            const newChatId = 'chat_' + Date.now();
            importedChat.id = newChatId;

            // Add to chats
            appState.chats[newChatId] = importedChat;

            // Save state
            saveAppState();

            // Load the imported chat
            loadChat(newChatId);

            // Update sidebar
            updateChatHistorySidebar();

            // Notify user
            const systemMessageElement = document.createElement('div');
            systemMessageElement.className = 'system-message';
            systemMessageElement.textContent = 'Chat imported successfully';
            elements.chatMessages.appendChild(systemMessageElement);

        } catch (error) {
            console.error('Error importing chat:', error);
            alert('Error importing chat: ' + error.message);
        }
    };

    reader.readAsText(file);
}

// Delete current chat
function deleteCurrentChat() {
    if (!appState.currentChatId || Object.keys(appState.chats).length <= 1) {
        // Don't delete the last chat
        createNewChat();
        return;
    }

    // Delete the chat
    delete appState.chats[appState.currentChatId];
    // Save state
    saveAppState();

    // Get next chat to display
    const chatIds = Object.keys(appState.chats);
    if (chatIds.length > 0) {
        loadChat(chatIds[0]);
    } else {
        createNewChat();
    }

    // Update sidebar
    updateChatHistorySidebar();
}

// Force scroll to bottom with multiple attempts to ensure it works
function forceScrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    // Immediate scroll
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Use multiple approaches to ensure scrolling works
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 50);

    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 150);

    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Add a final check to ensure we're at the bottom
        const lastMessage = chatMessages.lastElementChild;
        if (lastMessage) {
            lastMessage.scrollIntoView({ behavior: 'auto', block: 'end' });
        }
    }, 300);
}

// Scroll chat to bottom
function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Handle beforeunload event
function handleBeforeUnload(e) {
    if (Object.keys(appState.chats).length > 0) {
        // Show the leave page confirmation modal instead of browser dialog
        e.preventDefault();
        leavePageModalInstance.show();

        // Chrome requires returnValue to be set
        e.returnValue = '';
    }
}

// Place cursor at the end of contentEditable element
function placeCursorAtEnd(element) {
    // Create range and selection
    const range = document.createRange();
    const selection = window.getSelection();

    // Set range to end of element content
    range.selectNodeContents(element);
    range.collapse(false); // Collapse to end

    // Apply selection
    selection.removeAllRanges();
    selection.addRange(range);

    // Focus the element
    element.focus();
}

// Improved sound handling function
function playSoundSafely(audioElement) {
    if (!audioElement) return;

    console.log('Attempting to play sound:', audioElement.src);

    // Create a new Audio object each time to avoid issues with replaying
    const sound = new Audio(audioElement.src);

    // Set volume - sometimes helpful if sounds are too loud
    sound.volume = 0.7;

    // Play the sound with error handling
    sound.play().then(() => {
        console.log('Sound played successfully');
    }).catch(err => {
        console.warn('Could not play sound:', err.message);

        // Fallback approach - try again with user interaction
        if (err.name === 'NotAllowedError') {
            // Add a one-time click handler to the document that will play the sound
            const playOnClick = () => {
                sound.play().catch(e => console.warn('Still could not play sound:', e.message));
                document.removeEventListener('click', playOnClick);
            };
            document.addEventListener('click', playOnClick, { once: true });
            console.log('Sound will play on next user interaction');
        }
    });
}