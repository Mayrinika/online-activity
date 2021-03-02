import React from 'react';
import './Chat.css';

function Chat() {
    return (
        <div className="Chat">
            <div className="Chat-messages">
                <p>Message1</p>
                <p>Message2</p>
                <p>Message3</p>
                <p>Message4</p>
                <p>Message5</p>
                <p>Message6</p>
                <p>Message7</p>
                <p>Message8</p>
                <p>Message9</p>
                <p>Message10</p>
                <p>Message11</p>
                <p>Message12</p>
                <p>Message13</p>
                <p>Message14</p>
                <p>Message15</p>
            </div>
            <form>
                <label htmlFor="message">ваш ответ: </label>
                <input id="message" type="text"/>
                <input type="submit"/>
            </form>
        </div>
    );
}

export default Chat;
