import React, {Component} from 'react';
import './ListOfPlayers.css'

class ListOfPlayers extends Component<any, any>{
    render() {
        return (
            <div className="ListOfPlayers">
                <h5>Художник:</h5>
                {this.props.painter}
                <hr />
                <h5>Игроки:</h5>
                {this.props.players.map((p: string)=>(
                    <p>{p}</p>
                ))}
            </div>
        );
    }
}

export default ListOfPlayers;