import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
//components
//utils
import getRoutes from '../../utils/routes';
import getDomRoutes from "../../utils/domRoutes";
//styles
import './Leaderboard.css';

interface LeaderboardProps extends RouteComponentProps {
}

interface LeaderboardState {
    sortedLeaderboard: [string, number][];
}

class Leaderboard extends Component<LeaderboardProps, LeaderboardState> {
    constructor(props: LeaderboardProps) {
        super(props);
        this.state = {
            sortedLeaderboard: []
        };
    }

    componentDidMount() {
        this.getDataFromServer();
    }

    getDataFromServer = async () => {
        await fetch(getRoutes().leaderboard)
            .then(res => res.json())
            .then(leaderboard => {
                const sortedLeaderboard = Object.entries(leaderboard as { [playerName: string]: number })
                    .sort((a, b) => b[1] - a[1]);
                this.setState({
                    sortedLeaderboard
                });
            });
    };

    startOver = () => {
        this.props.history.push(getDomRoutes().login);
    };

    render() {
        const { sortedLeaderboard } = this.state;
        return (
            <div className='Leaderboard'>
                <p>Лидерборд:</p>
                {Object.entries(sortedLeaderboard).map(item => {
                    return (
                        <p key={item[0]}>{item[1][0]}: {item[1][1]}</p>
                    );
                })}
                <button onClick={this.startOver}>Начать заново</button>
            </div>
        );
    }
}

export default Leaderboard;