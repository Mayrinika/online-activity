import React, {Component} from 'react';
import {v4 as uuidv4} from 'uuid';
//styles
import './ListOfPlayers.css'
//utils
import {Player} from "../../utils/Types/types";
import {Typography} from "@material-ui/core";

interface ListOfPlayersProps {
    players: Player[];
    painter: Player;
}

class ListOfPlayers extends Component<ListOfPlayersProps, {}> {
    render() {
        return (
            <div className="ListOfPlayers" >
                <Typography variant='caption' align='left'>Художник:</Typography>
                <div className="player-wrapper">
                    {this.props.painter.avatar && <img src={this.props.painter.avatar as string} alt="avatar" className="avatar"/>}
                    <Typography variant='caption'>{this.props.painter.name}</Typography>
                </div>
                <Typography variant='caption'>Игроки:</Typography>
                <div className="ListOfPlayers-list">
                    {this.props.players.map((player: Player) => (
                        <div key={uuidv4()} className="player-wrapper">
                            {player.avatar && <img src={player.avatar as string} alt="avatar" className="avatar"/>}
                            <Typography variant='caption'>{player.name}</Typography>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

export default ListOfPlayers;