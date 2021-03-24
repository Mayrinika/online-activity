import React, {Component} from 'react';
import {v4 as uuidv4} from 'uuid';
//utils
import getRoutes from '../../utils/routes';
//styles
import './Chat.css';

interface chatProps {
    isPainter: boolean;
    wordIsGuessed: () => void;
    wordToGuess: string;
}

interface chatState {
    inputMessage: string;
    chatMessages: messageType[];
    currentGameId: string | null;
    currentPlayer: string | null;
}

interface messageType {
    name: string | null;
    text: string;
}

class Chat extends Component<chatProps, chatState> {
    constructor(props: chatProps) {
        super(props);
        this.state = {
            inputMessage: '',
            chatMessages: [],
            currentGameId: null,
            currentPlayer: null,
        }
    }

    async componentDidMount() { //TODO нужно добиться просто /chatMessages
        this.setState({
            currentGameId: localStorage.getItem('id'),
            currentPlayer: localStorage.getItem('name')
        }, (async () => await this.getChatMessages()));
    }

    getChatMessages = async () => {
        await fetch(getRoutes(this.state.currentGameId).chatMessages)
            .then(res => res.json())
            .then(chatMessages => {
                this.setState({
                    chatMessages
                })
            });
    }

    addMessage = (evt: React.ChangeEvent<HTMLFormElement>) => {
        evt.preventDefault();

        const {inputMessage, chatMessages, currentPlayer, currentGameId} = this.state;
        const {wordToGuess, wordIsGuessed} = this.props;

        if (wordToGuess === inputMessage) {
            wordIsGuessed();
        }

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
        const {chatMessages, inputMessage} = this.state;
        const {isPainter} = this.props;

        return (
            <div className="Chat">
                <div className="Chat-messages">
                    {chatMessages.map((message: messageType) => (
                        <p key={uuidv4()}><span className="Chat-message-name">{message.name}: </span>{message.text}</p>
                    ))}
                </div>
                {!isPainter &&
                <form onSubmit={this.addMessage}>
                    <label htmlFor="message">ваш ответ: </label>
                    <input
                        id="message"
                        type="text"
                        name="message"
                        placeholder="ваш ответ"
                        value={inputMessage}
                        onChange={this.enterMessage}
                    />
                    <input type="submit"/>
                </form>}
            </div>
        );
    }
}

export default Chat;
