import React, {Component} from 'react';
import {v4 as uuidv4} from 'uuid';
//utils
import getRoutes from '../../utils/routes';
//styles
import './Chat.css';

interface chatProps {
    currentPlayer: string;
    currentGameId: string;
}

interface chatState {
    inputMessage: string;
    chatMessages: messageType[];
}

interface messageType {
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

    componentDidMount() { //TODO нужно добиться просто /chatMessages
        fetch(getRoutes(this.props.currentGameId).chatMessages)
            .then(res => res.json())
            .then(chatMessages => {
                this.setState({
                    chatMessages
                })
            })
    }

    addMessage = (evt: React.ChangeEvent<HTMLFormElement>) => {
        evt.preventDefault();
        const {inputMessage, chatMessages} = this.state;
        const {currentPlayer, currentGameId} = this.props;

        fetch(getRoutes(currentGameId).chatMessages, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name: currentPlayer, text: inputMessage})
        })
            .then(res => {
                if (res.ok)
                    this.setState({
                        inputMessage: '',
                        chatMessages: [...chatMessages, {name: currentPlayer, text: inputMessage}]
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
                        <p key={uuidv4()}><span className="Chat-message-name">{message.name}: </span>{message.text}</p>
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
