import {RouteComponentProps} from "react-router-dom";
import React, {Component} from "react";
import {v4 as uuidv4} from 'uuid';
//components
import {ApiContext} from "../Api/ApiProvider";
//utils
import websocket from "../../utils/websocket";
import {SuggestedWord} from "../../utils/Types/types";
//styles
import './SuggestWord.css';
import {withStyles, WithStyles} from "@material-ui/core/styles";
import {Button, Container, TextField, Box} from '@material-ui/core';

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
        ws.onmessage = (response: any) => {
            this.setState({words: JSON.parse(response.data)});
        };
    }

    componentWillUnmount() {
        ws.close();
    }

    setConnection = (): void => {
        ws = new WebSocket('ws://localhost:8080');
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
            'author': localStorage.getItem('playerName')
        }));
    };
    dislikeWord = (wordId: string): void => {
        ws.send(JSON.stringify({
            'messageType': websocket.dislikeWord,
            'wordId': wordId,
            'author': localStorage.getItem('playerName')
        }));
    };

    render() {
        const {words, enteredWord} = this.state;
        let wordStatusHasChanged;
        if (words.some((word: SuggestedWord) => word.isApproved)) {
            const approvedWord = words.find(word => word.isApproved);
            if (approvedWord) {
                wordStatusHasChanged = `Слово ${approvedWord.word} было одобрено тремя игроками и попало в наш словарь!`;
            }
        }
        if (words.some((word: SuggestedWord) => word.isDeclined)) {
            const declinedWord = words.find(word => word.isDeclined);
            if (declinedWord) {
                wordStatusHasChanged = `Слово ${declinedWord.word} было удалено, так как не понравилось трем игрокам`;
            }
        }
        if (words.some((word: SuggestedWord) => word.isInDictionary)) {
            const suggestedWord = words.find(word => word.isInDictionary);
            if (suggestedWord) {
                wordStatusHasChanged = `Слово ${suggestedWord.word} уже есть в словаре`;
            }
        }
        const {classes} = this.props;
        return (
            <Container className={classes.outerContainer} maxWidth='lg' style={{height: 500}}>
                <Box>
                    <form onSubmit={this.sendWord} className={classes.innerContainer}>
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
                    <Box>
                        {this.state.words.filter(word => !word.isInDictionary && !word.isApproved && !word.isDeclined).map((word) => (
                            <div key={word.id} className="SuggestWord-word">
                                {word.word}
                                <div className="SuggestWord-buttons">
                                    <button
                                        className={`"SuggestedWord-button SuggestWord-button-plus" ${word.likes.includes(localStorage.getItem('playerName') || 'Аноним') ? "active" : ""}`}
                                        onClick={() => this.likeWord(word.id)}>+
                                    </button>
                                    <button
                                        className={`"SuggestedWord-button SuggestWord-button-plus" ${word.dislikes.includes(localStorage.getItem('playerName') || 'Аноним') ? "active" : ""}`}
                                        onClick={() => this.dislikeWord(word.id)}>-
                                    </button>
                                    <div>{word.likes.length - word.dislikes.length}</div>
                                </div>
                            </div>
                        ))}
                        <p>{wordStatusHasChanged}</p>
                    </Box>
                </Box>
            </Container>
        );
    }
}

export default (withStyles(styles)(SuggestWord));
