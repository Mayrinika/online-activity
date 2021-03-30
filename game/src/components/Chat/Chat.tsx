import React, {Component} from 'react';
import {v4 as uuidv4} from 'uuid';
//utils
import getRoutes from '../../utils/routes';
//styles
import './Chat.css';

const ws = new WebSocket('ws://localhost:8080');

interface chatProps {
    isPainter: boolean;
    wordIsGuessed: () => void;
    wordToGuess: string;
}

interface chatState {
    inputMessage: string;
    chatMessages: messageType[];
}

interface messageType {
    id: string;
    name: string | null;
    text: string;
    marks: {
        hot: boolean;
        cold: boolean;
    };
}

class Chat extends Component<chatProps, chatState> {
    constructor(props: chatProps) {
        super(props);
        this.state = {
            inputMessage: '',
            chatMessages: [],
        }
    }

    async componentDidMount() {
        await this.getChatMessages();
        ws.send(JSON.stringify({'gameId':localStorage.getItem('gameId')}));
        ws.onmessage = (response) => {
            console.log(response.data)
        };
    }

    getChatMessages = async () => {
        await fetch(getRoutes(localStorage.getItem('gameId')).chatMessages)
            .then(res => res.json())
            .then(chatMessages => {
                this.setState({
                    chatMessages
                })
            });
    }

    addMessage = (evt: React.ChangeEvent<HTMLFormElement>) => {
        evt.preventDefault();

        const {inputMessage, chatMessages} = this.state;
        const {wordToGuess, wordIsGuessed} = this.props;
        const playerName = localStorage.getItem('playerName');
        const gameId = localStorage.getItem('gameId');

        if (wordToGuess === inputMessage) {
            wordIsGuessed();
        }

        const generatedId = uuidv4();
        ws.send(JSON.stringify({'gameId':gameId, 'message': {'name': playerName, 'text': inputMessage, 'id':generatedId, 'marks': {'hot': false, 'cold': false}}}));
        fetch(getRoutes(gameId).chatMessages, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                name: playerName,
                text: inputMessage,
                id: generatedId,
                marks: {hot: false, cold: false}
            })
        })
            .then(res => {
                if (res.ok)
                    this.setState({
                        inputMessage: '',
                        chatMessages: [...chatMessages, {
                            id: generatedId,
                            name: playerName,
                            text: inputMessage,
                            marks: {hot: false, cold: false}
                        }]
                    })
            })
    }

    enterMessage = (evt: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({...this.state, inputMessage: evt.target.value});
    }

    handlePlusClick = (messageId: string) => {
        this.postMarks(messageId, true);
    }

    handleMinusClick = (messageId: string) => {
        this.postMarks(messageId, false);
    }

    postMarks(messageId: string, isHot: boolean) {
        fetch(getRoutes(localStorage.getItem('gameId')).addMark, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id: messageId, marks: {hot: isHot, cold: !isHot}})
        })
            .then(res => {
                if (res.ok) {
                    const currentIndex = this.state.chatMessages.findIndex(item => item.id === messageId);
                    const newChatMessages = JSON.parse(JSON.stringify(this.state.chatMessages));
                    newChatMessages[currentIndex].marks = {hot: isHot, cold: !isHot};
                    this.setState({
                        chatMessages: newChatMessages
                    })
                }
            })
    }

    showButtons = (message: messageType) => {
        if (this.props.isPainter) {
            return (
                <span>
                    <button onClick={() => this.handlePlusClick(message.id)}>hot</button>
                    <button onClick={() => this.handleMinusClick(message.id)}>cold</button>
                </span>
            );
        }
        if (message.marks.hot)
            return (
                <span>=hot</span>
            );
        if (message.marks.cold)
            return (
                <span>=cold</span>
            );
        return;
    }

    render() {
        const {chatMessages, inputMessage} = this.state;
        const {isPainter} = this.props;

        return (
            <div className="Chat">
                <div className="Chat-messages">
                    {chatMessages.map((message: messageType) => (
                        <div key={message.id}>
                            <span className="Chat-message-name">{message.name}: </span>{message.text}
                            {this.showButtons(message)}
                        </div>
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
