class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button'),
            closeButton: document.querySelector('.close-btn')
        }

        this.state = false;
        this.messages = [];
    }

    display() {
        const {openButton, chatBox, sendButton, closeButton} = this.args;

        openButton.addEventListener('click', () => this.toggleState(chatBox))

        closeButton.addEventListener('click', () => this.toggleState(chatBox))

        sendButton.addEventListener('click', () => this.onSendButton(chatBox))

        const node = chatBox.querySelector('input');
        node.addEventListener("keyup", ({key}) => {
            if (key === "Enter") {
                this.onSendButton(chatBox)
            }
        })
    }

    toggleState(chatbox) {
        this.state = !this.state;

        // show or hides the box
        if(this.state) {
            chatbox.classList.add('chatbox--active')
        } else {
            chatbox.classList.remove('chatbox--active')
        }
    }

    onSendButton(chatbox) {
        var textField = chatbox.querySelector('input');
        let text1 = textField.value;
        if (text1 === "") {
            return;
        }

        // Recupera il valore selezionato dal menu a tendina
        var roleSelect = document.getElementById('role-select');
        let selectedRole = roleSelect.value;

        let msg1 = { name: "User", message: text1, role: selectedRole };
        this.messages.push(msg1);
        this.updateChatText(chatbox);
        textField.value = '';

        // Costruisci l'URL dinamicamente utilizzando window.location
        const baseURL = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
        const apiEndpoint = '/predict';
        const fullURL = `${baseURL}${apiEndpoint}`;

        fetch(fullURL, {
            method: 'POST',
            body: JSON.stringify({ message: text1, role: selectedRole }), // Includi il ruolo selezionato
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json'
            },
        })
        .then(r => r.json())
        .then(r => {
            let msg2 = { name: "DomeGPT", message: r.answer };
            this.messages.push(msg2);
            this.updateChatText(chatbox);
        })
        .catch((error) => {
            console.error('Error:', error);
            this.updateChatText(chatbox);
        });
    }

    updateChatText(chatbox) {
        var html = '';
        this.messages.slice().reverse().forEach(function(item, index) {
            if (item.name === "DomeGPT") {
                html += '<div class="messages__item messages__item--visitor">' + item.message + '</div>';
            } else {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>';
            }
        });

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;
    }
}

const chatbox = new Chatbox();
chatbox.display();