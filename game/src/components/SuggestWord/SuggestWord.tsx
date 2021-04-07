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
                                <button className="SuggestedWord-button SuggestWord-button-plus" onClick={() => this.likeWord(word.id)}>+</button>
                                <button className="SuggestedWord-button SuggestWord-button-minus" onClick={() => this.dislikeWord(word.id)}>-</button>
                                <div>{word.likes.length - word.dislikes.length}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }
}
export default SuggestWord;
