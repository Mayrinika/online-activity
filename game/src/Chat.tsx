import React, {Component} from 'react';
import './Chat.css';

const serverURL = 'http://localhost:9000/';

type chatProps = {
    currentPlayer: string;
    currentGameId: string;
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
        fetch(`${serverURL}${this.props.currentGameId}`)
            .then(res => res.json())
            .then(game => {
                console.log(game);
                this.setState({
                    chatMessages: game.chatMessages
                })
            })
    }

    addMessage = (evt: React.ChangeEvent<HTMLFormElement>) => {
        evt.preventDefault();
        const {inputMessage, chatMessages} = this.state;
        const {currentPlayer, currentGameId} = this.props;
        const updatedChatMessages = [...chatMessages, {name: currentPlayer, text: inputMessage}];

        fetch(`${serverURL}${currentGameId}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id: currentGameId, chatMessages: updatedChatMessages})
        })
            .then(res => {
                if (res.ok)
                    this.setState({
                        inputMessage: '',
                        chatMessages: updatedChatMessages
                    })
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
