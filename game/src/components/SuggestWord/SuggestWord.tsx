import {RouteComponentProps} from "react-router-dom";
import React, {Component} from "react";
import './SuggestWord.css';
import getRoutes from "../../utils/routes";
import { v4 as uuidv4 } from 'uuid';

const ws= new WebSocket('ws://localhost:8080');

interface SuggestedWord {
    id: string;
    word: string;
    likes: {
        author: string;
        plus: boolean;
        minus: boolean;
    } [];
}

interface SuggestWordState {
    enteredWord: string;
    words: SuggestWord[];
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
            this.setState({words: JSON.parse(response.data).words});
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
        console.log(data);
        const words = JSON.parse(data);
        this.setState({words});
    }

    render() {
        return (
            <div className="SuggestWord">
                <form onSubmit={this.sendWord}>
                    <label htmlFor="wordInput">Предложите слово для игр:</label>
                    <input
                        type="text"
                        id="wordInput"
                        value={this.state.enteredWord}
                        onChange={this.enterWord}
                    />
                    <input type='submit' />
                </form>
                <div className="words-list">
                    {this.state.words.map((word) => (
                        <div>word.word</div>
                    ))}
                </div>
            </div>
        )
    }
}
export default SuggestWord;
