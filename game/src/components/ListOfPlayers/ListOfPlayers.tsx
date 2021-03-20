import React, {Component} from 'react';
import {v4 as uuidv4} from 'uuid';
//styles
import './ListOfPlayers.css'

interface listOfPlayersProps {
    players: string[];
    painter: string;
}

class ListOfPlayers extends Component<listOfPlayersProps, {}> {
    render() {
        return (
            <div className="ListOfPlayers">
                <h5>Художник:</h5>
                <p>{this.props.painter}</p>
                <h5>Игроки:</h5>
                <div className="ListOfPlayers-list">
                    {this.props.players.map((player: string) => (
                        <p key={uuidv4()}>{player}</p>
                    ))}
                </div>
            </div>
        );
    }
}

export default ListOfPlayers;