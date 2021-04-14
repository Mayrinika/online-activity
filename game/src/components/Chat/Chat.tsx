import React, { Component } from 'react';
import { v4 as uuidv4 } from 'uuid';
//utils
import getRoutes from '../../utils/routes';
//styles
import './Chat.css';

interface Player {
    name: string,
    avatar: string | ArrayBuffer | null;
}

interface ChatProps {
    isPainter: boolean;
    wordToGuess: string;
    painter: Player;
    sendMessage: (message: Message) => void;
    chatMessages: Message[];
    postMarks: (value: {id: string, marks: {hot: boolean, cold: boolean}}) => void;
    setWinner: (winner: string | null) => void;
}

interface ChatState {
    inputMessage: string;
}

interface Message {
    id: string;
    name: string;
    avatar: string | ArrayBuffer | null;
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
        };
    }

    addMessage = (evt: React.ChangeEvent<HTMLFormElement>) => {
        evt.preventDefault();
        const { inputMessage } = this.state;
        const { wordToGuess } = this.props;
        this.setState({inputMessage: ''});
        const playerName = localStorage.getItem('playerName');
        const gameId = localStorage.getItem('gameId');
        if (playerName === null || gameId === null)
            return;
        if (wordToGuess === inputMessage) {
            this.wordIsGuessed();
        }
        const generatedId = uuidv4();
        this.props.sendMessage({'name': playerName, avatar: null, 'text': inputMessage, 'id':generatedId, 'marks': {'hot': false, 'cold': false}})
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
        this.props.setWinner(playerName);
    };

    getWinner = (messageId: string) => {
        const message = this.props.chatMessages.find(message => message.id === messageId);
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
        this.props.postMarks({ id: messageId, marks: { hot: isHot, cold: !isHot } });
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
        const { inputMessage } = this.state;
        const { chatMessages, isPainter } = this.props;

        return (
            <div className='Chat'>
                <div className='Chat-messages'>
                    {chatMessages.map((message: Message) => (
                        <div key={message.id}>
                            {message.avatar && <img src={message.avatar as string} alt="avatar"/>}
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
