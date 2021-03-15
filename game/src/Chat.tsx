import React, {Component} from 'react';
import './Chat.css';

class Chat extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            message: '',
            messages: []
        }
    }
    addMessage = (evt: any) => {
        evt.preventDefault();
        this.setState({message: '', messages: [...this.state.messages, {name: this.props.currentPlayer, text: this.state.message}]});
        let json = JSON.stringify({name: this.props.currentPlayer, text: this.state.message});
        console.log(json);

    }
    enterMessage = (evt: any) => {
        this.setState({...this.state, message: evt.target.value});
    }
    render() {
        return (
            <div className="Chat">
                <div className="Chat-messages">
                    {this.state.messages.map((message: any) => (
                        <p><span className="Chat-message-name">{message.name}: </span>{message.text}</p>
                    ))}
                </div>
                <form onSubmit={this.addMessage} >
                    <label htmlFor="message">ваш ответ: </label>
                    <input
                        id="message"
                        type="text"
                        name="message"
                        placeholder="ваш ответ"
                        value={this.state.message}
                        onChange={this.enterMessage}
                    />
                    <input type="submit"/>
                </form>
            </div>
        );
    }
}

export default Chat;
