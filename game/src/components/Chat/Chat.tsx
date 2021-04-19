import React, { Component } from 'react';
import { v4 as uuidv4 } from 'uuid';
//components
import {ApiContext} from "../Api/ApiProvider";
//utils
import {Player, Message} from "../../utils/Types/types";
//styles
import './Chat.css';
import {Button, TextField, Typography, Tooltip} from "@material-ui/core";
import {WithStyles} from "@material-ui/core/styles";
import WhatshotIcon from '@material-ui/icons/Whatshot';
import CheckIcon from '@material-ui/icons/Check';
import AcUnitIcon from '@material-ui/icons/AcUnit';

const styles = (theme: { content: any; }) => (
    theme.content
);

interface ChatProps extends WithStyles<typeof styles>{
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
                <span style={{position: 'absolute', bottom: 0, zIndex: 2, right: 5}}>
                    <Tooltip title="Тепло">
                        <WhatshotIcon className="icon icon-hot" onClick={() => this.handlePlusClick(message.id)} style={{color: message.marks.hot ? 'red' : 'grey'}}/>
                    </Tooltip>
                    <Tooltip title="Холодно">
                        <AcUnitIcon className="icon icon-cold" onClick={() => this.handleMinusClick(message.id)} style={{color: message.marks.cold ? 'blue' : 'grey'}}/>
                    </Tooltip>
                    <Tooltip title="Правильно!">
                        <CheckIcon className="icon icon-ok" onClick={() => this.wordIsGuessed(message.id)}/>
                    </Tooltip>
                </span>
            );
        }
        if (message.marks.hot)
            return (
                <WhatshotIcon style={{color: 'red'}}/>
            );
        if (message.marks.cold)
            return (
                <AcUnitIcon style={{color: 'blue'}}/>
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
                        <div key={message.id} style={{display: 'flex', margin: 5, position: 'relative'}}>
                            {message.avatar && <img src={message.avatar as string} alt="avatar" style={{borderRadius: '50%', margin: '0 5px 0 0', width: '30px'}}/>}
                            <div className='Chat-message'>
                                <Typography variant='subtitle2'>
                                    {message.name}:
                                </Typography>
                                <Typography variant='subtitle2'>
                                    {message.text}
                                </Typography>
                            </div>
                            {this.showButtons(message)}
                        </div>
                    ))}
                </div>
                {!isPainter &&
                <form onSubmit={this.addMessage} style={{display: 'flex', margin: 0}}>
                    <TextField
                        id='message'
                        type='text'
                        name='message'
                        placeholder='ваш ответ'
                        value={inputMessage}
                        onChange={this.enterMessage}
                        variant="outlined"
                        margin="normal"
                        required
                        size="small"
                        label="ваш ответ: "
                        autoFocus
                        style={{margin: 0}}
                    />
                    <Button
                        className={this.props.classes.button}
                        variant="contained"
                        color="primary"
                        type="submit"
                        size="small"
                        style={{margin: 0}}
                    >
                        Отправить
                    </Button>
                </form>
                }
            </div>
        );
    }
}
export default Chat;
