import {RouteComponentProps} from "react-router-dom";
import React, {Component, ReactElement} from "react";
import {v4 as uuidv4} from 'uuid';
//components
import {ApiContext} from "../Api/ApiProvider";
//utils
import websocket from "../../utils/websocket";
import {SuggestedWord} from "../../utils/Types/types";
//styles
import './SuggestWord.css';
import {withStyles, WithStyles} from "@material-ui/core/styles";
import {Button, Container, TextField, Box, Tooltip, Typography} from '@material-ui/core';
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';

const styles = (theme: { content: any; }) => (
    theme.content
);

let ws: WebSocket;

interface SuggestWordState {
    enteredWord: string;
    words: SuggestedWord[];
}

interface SuggestWordProps extends RouteComponentProps, WithStyles<typeof styles> {
}

class SuggestWord extends Component<SuggestWordProps, SuggestWordState> {
    static contextType = ApiContext;

    constructor(props: SuggestWordProps) {
        super(props);
        this.state = {
            enteredWord: '',
            words: [],
        };
        this.setConnection();
    }

    async componentDidMount() {
        this.getWordsFromServer();
        this.setConnection();
        ws.onmessage = (response) => {
            this.setState({words: JSON.parse(response.data)});
        };
    }

    componentWillUnmount() {
        ws.close();
    }

    setConnection = (): void => {
        ws = new WebSocket('ws://localhost:9000');
    };

    sendWord = (evt: React.ChangeEvent<HTMLFormElement>): void => {
        evt.preventDefault();
        ws.send(JSON.stringify({
            'messageType': websocket.sendSuggestedWordToServer,
            'word': this.state.enteredWord,
            'id': uuidv4()
        }));
        this.setState({enteredWord: ''});
    };

    enterWord = (evt: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({...this.state, enteredWord: evt.target.value});
    };

    getWordsFromServer = async (): Promise<void> => {
        const words = await this.context.getSuggestWordsFromServer();
        this.setState({words});
    };

    likeWord = (wordId: string): void => {
        ws.send(JSON.stringify({
            'messageType': websocket.likeWord,
            'wordId': wordId,
            'author': this.context.user ? this.context.user.name : undefined
        }));
    };

    dislikeWord = (wordId: string): void => {
        ws.send(JSON.stringify({
            'messageType': websocket.dislikeWord,
            'wordId': wordId,
            'author': this.context.user ? this.context.user.name : undefined
        }));
    };

    renderForm = (): ReactElement => {
        const {classes} = this.props;
        const {enteredWord} = this.state;
        return (
            <form onSubmit={this.sendWord} className={"SuggestWord-Form " + classes.innerContainer}>
                <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="wordInput"
                    label="Введите слово"
                    name="word"
                    autoFocus
                    onChange={this.enterWord}
                    value={enteredWord}
                />
                <Button
                    className={classes.button}
                    variant="contained"
                    color="primary"
                    type="submit"
                    size="large"
                >
                    Предложить
                </Button>
            </form>
        );
    }

    renderWordsList = (): ReactElement => {
        const wordStatusHasChanged = this.getWordStatus();
        return (
            <Box className="SuggestWord-words-list">
                {this.state.words.filter(word => !word.isInDictionary && !word.isApproved && !word.isDeclined).map((word) => (
                    <div key={word.id} className="SuggestWord-word">
                        <Typography variant='h6'>
                            {word.word}
                        </Typography>
                        <div className="SuggestWord-buttons">
                            <Tooltip title="Супер">
                                <ThumbUpAltIcon
                                    className={"like " + (word.likes.includes((this.context.user ? this.context.user.name : undefined) || '') ? "like-active" : "")}
                                    onClick={() => this.likeWord(word.id)}
                                />
                            </Tooltip>
                            <Typography variant='subtitle1'
                                        className={"like-number " + (word.likes.includes((this.context.user ? this.context.user.name : undefined) || '') ? "like-active" : "")}
                            >
                                {word.likes.length}
                            </Typography>
                            <Tooltip title="Не очень">
                                <ThumbDownIcon
                                    className={"like " + (word.dislikes.includes((this.context.user ? this.context.user.name : undefined) || '') ? "like-active" : "")}
                                    onClick={() => this.dislikeWord(word.id)}
                                />
                            </Tooltip>
                            <Typography variant='subtitle1'
                                        className={"like-number " + (word.dislikes.includes((this.context.user ? this.context.user.name : undefined) || '') ? "like-active" : "")}
                            >
                                {word.dislikes.length}
                            </Typography>
                        </div>
                    </div>
                ))}
                <Typography variant='h6'>{wordStatusHasChanged}</Typography>
            </Box>
        );
    }

    getWordStatus = (): string => {
        const {words} = this.state;
        let wordStatusHasChanged = '';
        const approvedWord = words.find(word => word.isApproved);
        if (approvedWord) {
            wordStatusHasChanged = `Слово ${approvedWord.word} было одобрено тремя игроками и попало в наш словарь!`;
        }
        const declinedWord = words.find(word => word.isDeclined);
        if (declinedWord) {
            wordStatusHasChanged = `Слово ${declinedWord.word} было удалено, так как не понравилось трем игрокам`;
        }
        const suggestedWord = words.find(word => word.isInDictionary);
        if (suggestedWord) {
            wordStatusHasChanged = `Слово ${suggestedWord.word} уже есть в словаре`;
        }
        return wordStatusHasChanged;
    }

    render() {
        const {classes} = this.props;
        return (
            <Container className={classes.outerContainer + " SuggestWord"} maxWidth='lg'>
                <Typography variant='h6'>
                    Если у вас есть идеи слова для нашей игры, пожалуйста, добавьте его в форму ниже
                </Typography>
                <Box>
                    {this.renderForm()}
                    {this.renderWordsList()}
                </Box>
            </Container>
        );
    }
}

export default (withStyles(styles)(SuggestWord));
