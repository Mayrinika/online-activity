import React, { Component } from 'react';
import { v4 as uuidv4 } from 'uuid';
//components
import {ApiContext} from "../Api/ApiProvider";
//utils
import {Player, Message} from "../../utils/Types/types";
//styles
import './Chat.css';


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

class Chat extends Component<ChatProps, ChatState> {
    static contextType = ApiContext;
    constructor(props: ChatProps) {
        super(props);
        this.state = {
            inputMessage: '',
        };
    }

    addMessage = (evt: React.ChangeEvent<HTMLFormElement>): void => {
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

    enterMessage = (evt: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({ ...this.state, inputMessage: evt.target.value });
    };

    wordIsGuessed = async (messageId?: string): Promise<void> => {
        await this.context.clearCountdown();
        await this.setWinner(messageId);
    };

    setWinner = async (messageId?: string): Promise<void> => {
        let playerName = localStorage.getItem('playerName');
        if (messageId)
            playerName = this.getWinner(messageId) as string;
        this.props.setWinner(playerName);
    };

    getWinner = (messageId: string): string | undefined => {
        const message = this.props.chatMessages.find(message => message.id === messageId);
        if (message)
            return message.name;
    };

    handlePlusClick = (messageId: string): void => {
        this.postMarks(messageId, true);
    };

    handleMinusClick = (messageId: string): void => {
        this.postMarks(messageId, false);
    };

    postMarks(messageId: string, isHot: boolean): void {
        this.props.postMarks({ id: messageId, marks: { hot: isHot, cold: !isHot } });
    }

    showButtons = (message: Message) => { //TODO return type
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
