document.addEventListener('DOMContentLoaded', () => {
    const messagesContainer = document.getElementById('messages-container');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('fileElem');
    const uploadStatus = document.getElementById('upload-status');

    // --- Chat Functionality ---

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        contentDiv.innerHTML = text.replace(/\n/g, '<br>'); // Simple formatting

        const timestampDiv = document.createElement('div');
        timestampDiv.classList.add('timestamp');
        timestampDiv.innerText = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timestampDiv);

        messagesContainer.appendChild(messageDiv);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.classList.add('typing-indicator', 'bot');
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        messagesContainer.appendChild(typingDiv);
        scrollToBottom();
        return typingDiv;
    }

    function removeTypingIndicator(indicator) {
        if (indicator && indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    }

    async function sendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        // 1. Add User Message
        addMessage(text, 'user');
        userInput.value = '';

        // 2. Show Typing Indicator
        const typingIndicator = showTypingIndicator();

        try {
            // 3. API Call
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();

            // 4. Remove Typing & Add Bot Message
            setTimeout(() => { // Artifical delay for effect if response is too fast
                removeTypingIndicator(typingIndicator);
                addMessage(data.response, 'bot');
            }, 600);

        } catch (error) {
            console.error('Error:', error);
            removeTypingIndicator(typingIndicator);
            addMessage("I'm having trouble connecting to my neural network. Please try again.", 'bot');
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // --- File Upload Functionality ---

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Highlight drop area
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.style.borderColor = '#38bdf8', false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.style.borderColor = '#94a3b8', false);
    });

    // Handle Drop
    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    // Handle Click
    dropArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', function () {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        ([...files]).forEach(uploadFile);
    }

    async function uploadFile(file) {
        if (file.type !== "text/plain") {
            uploadStatus.innerText = "Error: Only .txt files supported for now.";
            uploadStatus.style.color = "red";
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        uploadStatus.innerText = `Uploading ${file.name}...`;
        uploadStatus.style.color = "#38bdf8";

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (response.ok) {
                uploadStatus.innerText = "Upload Complete!";
                uploadStatus.style.color = "#4ade80";
                setTimeout(() => uploadStatus.innerText = "", 3000);
            } else {
                uploadStatus.innerText = "Upload Failed.";
                uploadStatus.style.color = "red";
            }
        } catch (error) {
            console.error('Error:', error);
            uploadStatus.innerText = "Connection Error.";
        }
    }
});
