import React, { Component } from 'react';
import { v4 as uuidv4 } from 'uuid';
//utils
import getRoutes from '../../utils/routes';
//styles
import './Chat.css';

interface ChatProps {
    isPainter: boolean;
    // wordIsGuessed: () => void;
    wordToGuess: string;
    painter: string;
}

interface ChatState {
    inputMessage: string;
    chatMessages: Message[];
}

interface Message {
    id: string;
    name: string;
    text: string;
    marks: {
        hot: boolean;
        cold: boolean;
    };
}

class Chat extends Component<ChatProps, ChatState> {
    constructor(props: ChatProps) {
        super(props);
        this.state = {
            inputMessage: '',
            chatMessages: []
        };
    }

    async componentDidMount() {
        await this.getChatMessages();
    }

    getChatMessages = async () => {
        await fetch(getRoutes(localStorage.getItem('gameId')).chatMessages)
            .then(res => res.json())
            .then(chatMessages => {
                this.setState({
                    chatMessages
                });
            });
    };

    addMessage = (evt: React.ChangeEvent<HTMLFormElement>) => {
        evt.preventDefault();

        const { inputMessage, chatMessages } = this.state;
        const { wordToGuess } = this.props;
        const playerName = localStorage.getItem('playerName');
        const gameId = localStorage.getItem('gameId');
        if (playerName === null || gameId === null)
            return;

        if (wordToGuess === inputMessage) {
            this.wordIsGuessed();
        }

        const generatedId = uuidv4();
        fetch(getRoutes(gameId).chatMessages, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: playerName,
                text: inputMessage,
                id: generatedId,
                marks: { hot: false, cold: false }
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
                            marks: { hot: false, cold: false }
                        }]
                    });
            });
    };

    enterMessage = (evt: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ ...this.state, inputMessage: evt.target.value });
    };

    wordIsGuessed = async (messageId?: string) => {
        await this.clearCountdown();
        await this.setWinner(messageId);
    };

    clearCountdown = async () => {
        await fetch(getRoutes(localStorage.getItem('gameId')).clearCountdown, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            }
        });
    };

    setWinner = async (messageId?: string) => {
        let playerName = localStorage.getItem('playerName');
        if (messageId)
            playerName = this.getWinner(messageId) as string;
        await fetch(getRoutes(localStorage.getItem('gameId')).setWinner, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({ winner: playerName })
        });
    };

    getWinner = (messageId: string) => {
        const message = this.state.chatMessages.find(message => message.id === messageId);
        if (message)
            return message.name;
    };

    handlePlusClick = (messageId: string) => {
        this.postMarks(messageId, true);
    };

    handleMinusClick = (messageId: string) => {
        this.postMarks(messageId, false);
    };

    postMarks(messageId: string, isHot: boolean) {
        fetch(getRoutes(localStorage.getItem('gameId')).addMark, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: messageId, marks: { hot: isHot, cold: !isHot } })
        })
            .then(res => {
                if (res.ok) {
                    const currentIndex = this.state.chatMessages.findIndex(item => item.id === messageId);
                    const newChatMessages = JSON.parse(JSON.stringify(this.state.chatMessages));
                    newChatMessages[currentIndex].marks = { hot: isHot, cold: !isHot };
                    this.setState({
                        chatMessages: newChatMessages
                    });
                }
            });
    }

    showButtons = (message: Message) => {
        const { isPainter } = this.props;
        if (isPainter) {
            return (
                <span>
                    <button onClick={() => this.handlePlusClick(message.id)}>hot</button>
                    <button onClick={() => this.handleMinusClick(message.id)}>cold</button>
                    <button onClick={() => this.wordIsGuessed(message.id)}>да!</button>
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
    };

    render() {
        const { chatMessages, inputMessage } = this.state;
        const { isPainter } = this.props;

        return (
            <div className='Chat'>
                <div className='Chat-messages'>
                    {chatMessages.map((message: Message) => (
                        <div key={message.id}>
                            <span className='Chat-message-name'>{message.name}: </span>{message.text}
                            {this.showButtons(message)}
                        </div>
                    ))}
                </div>
                {!isPainter &&
                <form onSubmit={this.addMessage}>
                    <label htmlFor='message'>ваш ответ: </label>
                    <input
                        id='message'
                        type='text'
                        name='message'
                        placeholder='ваш ответ'
                        value={inputMessage}
                        onChange={this.enterMessage}
                    />
                    <input type='submit' />
                </form>}
            </div>
        );
    }
}

export default Chat;
