import React, {Component} from 'react';
//components
//utils
//styles

interface leaderboardProps {
}

interface leaderboardState {
}

class Leaderboard extends Component<leaderboardProps, leaderboardState> {
    constructor(props: leaderboardProps) {
        super(props);
    }

    render() {
        return (
            <h1>Leaderboard</h1>
        );
    }
}

export default Leaderboard;