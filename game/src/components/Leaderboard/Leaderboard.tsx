import React, { Component } from 'react';
//components
//utils
import getRoutes from '../../utils/routes';
//styles
import './Leaderboard.css';

interface leaderboardProps {
}

interface leaderboardType {
    playerName: string;
    score: number;
}

interface leaderboardState {
    leaderboard: leaderboardType;
}

class Leaderboard extends Component<leaderboardProps, leaderboardState> {
    constructor(props: leaderboardProps) {
        super(props);
        this.state = {
            leaderboard: {
                playerName: '',
                score: 0
            }
        };
    }

    componentDidMount() {
        this.getDataFromServer();
    }

    getDataFromServer = async () => {
        await fetch(getRoutes().leaderboard)
            .then(res => res.json())
            .then(leaderboard => {
                this.setState({
                    leaderboard
                });
            });
    };

    render() {
        const { leaderboard } = this.state;
        return (
            <div className='Leaderboard'>
                <p>Лидерборд:</p>
                {Object.entries(leaderboard).map(item => {
                    return (
                        <p key={item[0]}>{item[0]}: {item[1]}</p>
                    );
                })}
            </div>
        );
    }
}

export default Leaderboard;