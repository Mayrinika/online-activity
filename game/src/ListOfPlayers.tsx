import React, {Component} from 'react';
import './ListOfPlayers.css'

class ListOfPlayers extends Component<any, any>{
    render() {
        return (
            <div className="ListOfPlayers">
                <h5>Художник:</h5>
                <p>{this.props.painter}</p>
                <h5>Игроки:</h5>
                <div className="ListOfPlayers-list">
                    {this.props.players.map((player: string)=>(
                        <p>{player}</p>
                    ))}
                </div>
            </div>
        );
    }
}

export default ListOfPlayers;