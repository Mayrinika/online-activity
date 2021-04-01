import React, { Component } from 'react';
import { v4 as uuidv4 } from 'uuid';
//utils
import getRoutes from '../../utils/routes';
//styles
import './Chat.css';
import {RouteComponentProps} from "react-router-dom";

interface ChatProps extends RouteComponentProps{
    isPainter: boolean;
    // wordIsGuessed: () => void;
    wordToGuess: string;
    painter: string;
    ws: any;
}

interface ChatState {
    inputMessage: string;
    chatMessages: Message[];
    isGameOver: boolean;
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
            chatMessages: [],
            isGameOver: false,
        };
    }

    async componentDidMount() {
        await this.getCurrentGame();
        this.props.ws.onmessage = (response: any) => { //TODO оправить тип
            this.setState({chatMessages: JSON.parse(response.data).chatMessages, isGameOver: JSON.parse(response.data).isGameOver});
        };
    }

    componentDidUpdate() {
        if (this.state.isGameOver) this.gameOver();
    }

    gameOver = () => {
        this.props.history.push(`/${localStorage.getItem('gameId')}/game-over`);
    };

    getCurrentGame = async () => {
        const res = await fetch(getRoutes(localStorage.getItem('gameId')).gameId);
        const data = await res.text();
        const game = JSON.parse(data);
        this.setState({chatMessages: game.chatMessages});
    }

    addMessage = (evt: React.ChangeEvent<HTMLFormElement>) => {
        evt.preventDefault();
        const { inputMessage } = this.state;
        const { wordToGuess } = this.props;
        const playerName = localStorage.getItem('playerName');
        const gameId = localStorage.getItem('gameId');
        if (playerName === null || gameId === null) {
            return;
        }
        if (wordToGuess === inputMessage) {
            this.wordIsGuessed();
        }
        const generatedId = uuidv4();
        this.props.ws.send(JSON.stringify({'messageType':'addMessage', 'gameId':gameId, 'message': {'name': playerName, 'text': inputMessage, 'id':generatedId, 'marks': {'hot': false, 'cold': false}}}));
        this.setState({inputMessage: ''});
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
        if (messageId) {
            playerName = this.getWinner(messageId) as string;
        }
        this.props.ws.send(JSON.stringify({'messageType':'setWinner', 'gameId':localStorage.getItem('gameId'), 'winner': playerName }));
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
        this.props.ws.send(JSON.stringify({'messageType':'addMark', 'gameId':localStorage.getItem('gameId'), 'message': { id: messageId, marks: { hot: isHot, cold: !isHot }}}));
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
