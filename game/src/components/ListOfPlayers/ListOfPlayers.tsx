import React, {Component} from 'react';
import {v4 as uuidv4} from 'uuid';
//styles
import './ListOfPlayers.css'

interface Player {
    name: string,
    avatar: string | ArrayBuffer | null;
}

interface ListOfPlayersProps {
    players: Player[];
    painter: Player;
}

class ListOfPlayers extends Component<ListOfPlayersProps, {}> {
    render() {
        return (
            <div className="ListOfPlayers">
                <h5>Художник:</h5>
                {this.props.painter.avatar && <img src={this.props.painter.avatar as string} alt="avatar" />}
                <p>{this.props.painter.name}</p>
                <h5>Игроки:</h5>
                <div className="ListOfPlayers-list">
                    {this.props.players.map((player: Player) => (
                        <div key={uuidv4()}>
                            {player.avatar && <img src={player.avatar as string} alt="avatar" />}
                            <p>{player.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

export default ListOfPlayers;