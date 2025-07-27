// --- CHATBOT SCRIPT WITH IMAGE UPLOAD AND LOCAL STORAGE ---
const chatWindow = document.getElementById("chat-window");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const sendButton = document.getElementById("send-button");
const fileUpload = document.getElementById("file-upload");
const imagePreviewContainer = document.getElementById("image-preview-container");

// Environment variables for Vercel deployment
const supabaseFunctionUrl = window.SUPABASE_FUNCTION_URL || 'https://keuxuonslkcvdeysdoge.supabase.co/functions/v1/gemini-tea';
const supabaseAnonKey = window.SUPABASE_ANON_KEY || '';

// Global variables for image handling
let selectedImageData = null;
let selectedImageMimeType = null;

// Local Storage Functions
function saveChatHistory() {
    const messages = Array.from(chatWindow.children).map(msg => ({
        text: msg.textContent,
        sender: msg.classList.contains('user-message') ? 'user' : 'bot',
        hasImage: msg.querySelector('img.sent-image') !== null,
        imageData: msg.querySelector('img.sent-image')?.src || null
    }));
    localStorage.setItem('teaLeakChatHistory', JSON.stringify(messages));
}

function loadChatHistory() {
    const savedHistory = localStorage.getItem('teaLeakChatHistory');
    if (savedHistory) {
        const messages = JSON.parse(savedHistory);
        messages.forEach(msg => {
            addMessage(msg.text, msg.sender, msg.hasImage ? msg.imageData : null);
        });
    }
}

function clearChatHistory() {
    localStorage.removeItem('teaLeakChatHistory');
    chatWindow.innerHTML = '';
}

// Image Upload Functions
fileUpload.addEventListener('change', handleImageSelection);

function handleImageSelection(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        selectedImageData = e.target.result.split(',')[1]; // Remove data:image/...;base64, prefix
        selectedImageMimeType = file.type;
        showImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
}

function showImagePreview(imageSrc) {
    imagePreviewContainer.innerHTML = `
        <div class="image-preview-wrapper">
            <img id="image-preview" src="${imageSrc}" alt="Selected image">
            <div id="remove-image-btn" onclick="removeImagePreview()">×</div>
        </div>
    `;
    imagePreviewContainer.classList.add('visible');
}

function removeImagePreview() {
    selectedImageData = null;
    selectedImageMimeType = null;
    imagePreviewContainer.classList.remove('visible');
    setTimeout(() => {
        imagePreviewContainer.innerHTML = '';
    }, 500);
    fileUpload.value = '';
}

// Chat Form Submission
chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = chatInput.value.trim();
    
    // Require either message or image
    if (!message && !selectedImageData) return;

    // Add user message to chat
    addMessage(message, "user", selectedImageData ? `data:${selectedImageMimeType};base64,${selectedImageData}` : null);
    
    // Clear inputs
    chatInput.value = "";
    const imageDataToSend = selectedImageData;
    const mimeTypeToSend = selectedImageMimeType;
    removeImagePreview();
    
    sendButton.disabled = true;

    try {
        // Create AbortController for timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const requestBody = {
            message: message || null,
            imageData: imageDataToSend || null,
            mimeType: mimeTypeToSend || null
        };

        const response = await fetch(supabaseFunctionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseAnonKey}`
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if(data.error) {
            throw new Error(data.error);
        }

        addMessage(data.response, "bot");
        saveChatHistory();

    } catch (error) {
        console.error("Error:", error);
        if (error.name === 'AbortError') {
            addMessage("Request timed out. Please try again.", "bot");
        } else {
            addMessage("Sorry, something went wrong. Please try again.", "bot");
        }
    } finally {
        sendButton.disabled = false;
        chatInput.focus();
    }
});

/**
 * Escapes HTML characters to prevent XSS attacks
 * @param {string} text - The text to escape
 * @returns {string} - The escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Formats response text with basic markdown-like formatting
 * @param {string} text - The text to format
 * @returns {string} - The formatted HTML
 */
function formatResponse(text) {
    // Full HTML entity escaping
    let safeText = escapeHtml(text);

    // Convert **bold** to <strong>
    safeText = safeText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convert *italics* to <em>
    safeText = safeText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert newlines to <br> tags for paragraphs
    safeText = safeText.replace(/\n/g, '<br>');

    return safeText;
}

/**
 * Adds a message to the chat window
 * @param {string} text - The message text
 * @param {string} sender - Either 'user' or 'bot'
 * @param {string} imageSrc - Optional image source for user messages
 */
function addMessage(text, sender, imageSrc = null) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("chat-message", `${sender}-message`);

    if (sender === 'bot') {
        // Use safer DOM manipulation for bot messages
        const formattedHtml = formatResponse(text);
        messageElement.innerHTML = formattedHtml;
    } else {
        // User messages as plain text
        messageElement.textContent = text;
        
        // Add image if provided
        if (imageSrc) {
            const imageElement = document.createElement('img');
            imageElement.src = imageSrc;
            imageElement.classList.add('sent-image');
            imageElement.alt = 'Sent image';
            messageElement.appendChild(imageElement);
        }
    }

    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Add keyboard shortcut for clearing chat (Ctrl+Shift+C)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        if (confirm('Clear all chat history?')) {
            clearChatHistory();
        }
    }
});

// Load chat history on page load
document.addEventListener('DOMContentLoaded', function() {
    loadChatHistory();
    chatInput.focus();
});