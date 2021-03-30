import React, { Component } from 'react';
//components
//utils
import getRoutes from '../../utils/routes';
//styles
import './Leaderboard.css';

interface leaderboardProps {
}

interface leaderboardState {
    sortedLeaderboard: [string, number][];
}

class Leaderboard extends Component<leaderboardProps, leaderboardState> {
    constructor(props: leaderboardProps) {
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
                    .sort((a, b) => b[1] - a[1]); //TODO поправить сортировку
                this.setState({
                    sortedLeaderboard
                });
            });
    };

    render() {
        const { sortedLeaderboard } = this.state;
        return (
            <div className='Leaderboard'>
                <p>Лидерборд:</p>
                {Object.entries(sortedLeaderboard).map(item => {
                    return (
                        <p key={item[0]}>{item[0]}: {item[1]}</p>
                    );
                })}
            </div>
        );
    }
}

export default Leaderboard;