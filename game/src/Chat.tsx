import React, {Component} from 'react';
import './Chat.css';

type chatProps = {
    currentPlayer: string;
}

type chatState = {
    inputMessage: string;
    chatMessages: messageType[];
}

type messageType = {
    name: string;
    text: string;
}

class Chat extends Component<chatProps, chatState> {
    constructor(props: chatProps) {
        super(props);
        this.state = {
            inputMessage: '',
            chatMessages: []
        }
    }

    componentDidMount() {
        fetch('http://localhost:9000/chatMessages')
            .then(res => res.json())
            .then(chatMessages => {
                this.setState({
                    chatMessages
                });
            });
    }

    addMessage = (evt: React.ChangeEvent<HTMLFormElement>) => {
        evt.preventDefault();
        const {inputMessage, chatMessages} = this.state;
        const {currentPlayer} = this.props;

        fetch('http://localhost:9000/chatMessages', {
            method: 'POST',
            body: JSON.stringify({name: currentPlayer, text: inputMessage}),
            headers: {'Content-Type': 'application/json'},
        })
            .then(res => {
                if (res.ok)
                    this.setState({
                        inputMessage: '',
                        chatMessages: [...chatMessages, {name: currentPlayer, text: inputMessage}]
                    });
            })
    }
    enterMessage = (evt: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({...this.state, inputMessage: evt.target.value});
    }

    render() {
        return (
            <div className="Chat">
                <div className="Chat-messages">
                    {this.state.chatMessages.map((message: messageType) => (
                        <p><span className="Chat-message-name">{message.name}: </span>{message.text}</p>
                    ))}
                </div>
                <form onSubmit={this.addMessage}>
                    <label htmlFor="message">ваш ответ: </label>
                    <input
                        id="message"
                        type="text"
                        name="message"
                        placeholder="ваш ответ"
                        value={this.state.inputMessage}
                        onChange={this.enterMessage}
                    />
                    <input type="submit"/>
                </form>
            </div>
        );
    }
}

export default Chat;
