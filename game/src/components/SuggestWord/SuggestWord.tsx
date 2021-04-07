import {RouteComponentProps} from "react-router-dom";
import React, {Component} from "react";
import './SuggestWord.css';
import getRoutes from "../../utils/routes";
import { v4 as uuidv4 } from 'uuid';

const ws= new WebSocket('ws://localhost:8080');

interface SuggestedWord {
    id: string;
    word: string;
    likes: string[];
    dislikes: string[];
    isApproved: boolean;
    isDeclined: boolean;
}

interface SuggestWordState {
    enteredWord: string;
    words: SuggestedWord[];
}
interface SuggestWordProps extends RouteComponentProps {

}

class SuggestWord extends Component<SuggestWordProps, SuggestWordState> {
    constructor(props: SuggestWordProps) {
        super(props);
        this.state = {
            enteredWord: '',
            words: [],
        }
    }
    componentDidMount() {
        this.getWordsFromServer();
        ws.onmessage = (response: any) => {
            this.setState({words: JSON.parse(response.data)});
        }
    }
    sendWord = (evt: React.ChangeEvent<HTMLFormElement>) => {
        evt.preventDefault();
        ws.send(JSON.stringify({'messageType':'sendSuggestedWord', 'word':this.state.enteredWord, 'id':uuidv4()}));
        this.setState({enteredWord: ''});
    }
    enterWord = (evt: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ ...this.state, enteredWord: evt.target.value });
    }
    getWordsFromServer = async() => {
        const res = await fetch(getRoutes().suggestedWords);
        const data = await res.text();
        const words = JSON.parse(data);
        this.setState({words});
    }
    likeWord = (wordId: string) => {
        ws.send(JSON.stringify({'messageType':'likeWord', 'wordId':wordId, 'author':localStorage.getItem('playerName')}));
    }
    dislikeWord = (wordId: string) => {
        ws.send(JSON.stringify({'messageType':'dislikeWord', 'wordId':wordId, 'author':localStorage.getItem('playerName')}));
    }
    render() {
        let wordStatusHasChanged;
        if (this.state.words.some((word: SuggestedWord) => word.isApproved)) {
            const approvedWord = this.state.words.find(word => word.isApproved);
            // @ts-ignore
            wordStatusHasChanged = `Слово ${approvedWord.word} было одобрено тремя игроками и попало в наш словарь!`
        }
        if (this.state.words.some((word: SuggestedWord) => word.isDeclined)) {
            const declinedWord = this.state.words.find(word => word.isDeclined);
            // @ts-ignore
            wordStatusHasChanged = `Слово ${declinedWord.word} было удалено, так как не понравилось трем игрокам`
        }
        return (
            <div className="SuggestWord">
                <form className="SuggestWord-from" onSubmit={this.sendWord}>
                    <label htmlFor="wordInput">Предложите слово для игр:</label>
                    <input
                        type="text"
                        id="wordInput"
                        value={this.state.enteredWord}
                        onChange={this.enterWord}
                    />
                    <input type='submit' />
                </form>
                <div className="SuggestWord-words-list">
                    {this.state.words.map((word) => (
                        <div key={word.id} className="SuggestWord-word">
                            {word.word}
                            <div className="SuggestWord-buttons">
                                <button
                                    // @ts-ignore
                                    className={`"SuggestedWord-button SuggestWord-button-plus" ${word.likes.includes(localStorage.getItem('playerName')) ? "active" : ""}`}
                                    onClick={() => this.likeWord(word.id)}>+
                                </button>
                                <button
                                    // @ts-ignore
                                    className={`"SuggestedWord-button SuggestWord-button-plus" ${word.dislikes.includes(localStorage.getItem('playerName')) ? "active" : ""}`}
                                    onClick={() => this.dislikeWord(word.id)}>-
                                </button>
                                <div>{word.likes.length - word.dislikes.length}</div>
                            </div>
                        </div>
                    ))}
                    <p>{wordStatusHasChanged}</p>
                </div>
            </div>
        )
    }
}
export default SuggestWord;
