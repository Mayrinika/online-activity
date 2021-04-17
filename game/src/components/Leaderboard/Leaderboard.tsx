import React, {Component} from 'react';
import {RouteComponentProps} from 'react-router-dom';
//components
import {ApiContext} from "../Api/ApiProvider";
//utils
import getDomRoutes from "../../utils/domRoutes";
import {Player} from "../../utils/Types/types";
//styles
import {withStyles, WithStyles} from "@material-ui/core/styles";
import {Button, Container, Typography} from '@material-ui/core';

const styles = (theme: { content: any; }) => (
    theme.content
);

interface LeaderboardProps extends RouteComponentProps, WithStyles<typeof styles> {
}

interface LeaderboardState {
    sortedLeaderboard: { player: Player, score: number }[];
}

class Leaderboard extends Component<LeaderboardProps, LeaderboardState> {
    static contextType = ApiContext;

    constructor(props: LeaderboardProps) {
        super(props);
        this.state = {
            sortedLeaderboard: []
        };
    }

    async componentDidMount() {
        const sortedLeaderboard = await this.context.getLeaderboardDataFromServer();
        this.setState({sortedLeaderboard});
    }

    startOver = () => {
        this.props.history.push(getDomRoutes().main);
    };

    render() {
        const {sortedLeaderboard} = this.state;
        const {classes} = this.props;
        return (
            <Container className={classes.outerContainer} maxWidth='sm'>
                <Typography variant='h5' paragraph>Лидерборд:</Typography>
                {sortedLeaderboard.map((item: { player: Player, score: number }) => {
                    return (
                        <Typography variant='subtitle1' paragraph className={classes.playerContainer}
                                    key={item.player.name}>
                            {item.player.avatar && <img src={item.player.avatar as string} alt="avatar"/>}
                            {item.player.name}: {item.score}
                        </Typography>
                    );
                })}
                <Button
                    className={classes.button}
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={this.startOver}
                >Начать заново</Button>
            </Container>
        );
    }
}

export default (withStyles(styles)(Leaderboard));