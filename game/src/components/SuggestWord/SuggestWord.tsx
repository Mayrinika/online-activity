import {RouteComponentProps} from "react-router-dom";
import React, {Component} from "react";
import {v4 as uuidv4} from 'uuid';
//components
//utils
import getRoutes from "../../utils/routes";
//styles
import './SuggestWord.css';
import {withStyles, WithStyles} from "@material-ui/core/styles";
import {Button, Container, Grid, Typography, TextField, Box} from '@material-ui/core';

const styles = (theme: { content: any; }) => (
    theme.content
);

const ws = new WebSocket('ws://localhost:8080');

interface SuggestedWord {
    id: string;
    word: string;
    likes: string[];
    dislikes: string[];
    isApproved: boolean;
    isDeclined: boolean;
    isInDictionary: boolean;
}

interface SuggestWordState {
    enteredWord: string;
    words: SuggestedWord[];
}

interface SuggestWordProps extends RouteComponentProps, WithStyles<typeof styles> {

}

class SuggestWord extends Component<SuggestWordProps, SuggestWordState> {
    constructor(props: SuggestWordProps) {
        super(props);
        this.state = {
            enteredWord: '',
            words: [],
        };
    }

    componentDidMount() {
        this.getWordsFromServer();
        ws.onmessage = (response: any) => {
            this.setState({words: JSON.parse(response.data)});
        };
    }

    sendWord = (evt: React.ChangeEvent<HTMLFormElement>) => {
        evt.preventDefault();
        ws.send(JSON.stringify({'messageType': 'sendSuggestedWord', 'word': this.state.enteredWord, 'id': uuidv4()}));
        this.setState({enteredWord: ''});
    };
    enterWord = (evt: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({...this.state, enteredWord: evt.target.value});
    };
    getWordsFromServer = async () => {
        const res = await fetch(getRoutes().suggestedWords);
        const data = await res.text();
        const words = JSON.parse(data);
        this.setState({words});
    };
    likeWord = (wordId: string) => {
        ws.send(JSON.stringify({
            'messageType': 'likeWord',
            'wordId': wordId,
            'author': localStorage.getItem('playerName')
        }));
    };
    dislikeWord = (wordId: string) => {
        ws.send(JSON.stringify({
            'messageType': 'dislikeWord',
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
                <Box >
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
                        {this.state.words.filter(word => !word.isInDictionary).map((word) => (
                            <div key={word.id} className="SuggestWord-word">
                                {word.word}
                                <div className="SuggestWord-buttons">
                                    <button
                                        className={`"SuggestedWord-button SuggestWord-button-plus" ${word.likes.includes(localStorage.getItem('playerName')||'Аноним') ? "active" : ""}`}
                                        onClick={() => this.likeWord(word.id)}>+
                                    </button>
                                    <button
                                        className={`"SuggestedWord-button SuggestWord-button-plus" ${word.dislikes.includes(localStorage.getItem('playerName')||'Аноним') ? "active" : ""}`}
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
