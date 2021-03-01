import React from 'react';
import './Chat.css';

function Chat() {
    return (
        <div className="Chat">
            <p>Message1</p>
            <p>Message2</p>
            <p>Message3</p>
            <form>
                <label htmlFor="message">ваш ответ: </label>
                <input id="message" type="text"/>
                <input type="submit"/>
            </form>
        </div>
    );
}

export default Chat;
