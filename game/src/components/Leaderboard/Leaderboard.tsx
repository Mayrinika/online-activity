import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
//components
import {ApiContext} from "../Api/ApiProvider";
//utils
import getRoutes from '../../utils/routes';
import getDomRoutes from "../../utils/domRoutes";
import checkLogin from "../../utils/checkLogin";
//styles
import {withStyles, WithStyles} from "@material-ui/core/styles";
import {Button, Container, Typography} from '@material-ui/core';


const styles = (theme: { content: any; }) => (
    theme.content
);

interface LeaderboardProps extends RouteComponentProps, WithStyles<typeof styles> {
    setAuthorized: () => void;
}

interface LeaderboardState {
    sortedLeaderboard: [string, number][];
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
        checkLogin(this.props.setAuthorized);
    }

    startOver = () => {
        this.props.history.push(getDomRoutes().main);
    };

    render() {
        const { sortedLeaderboard } = this.state;
        const {classes} = this.props;
        return (
            <Container className={classes.outerContainer} maxWidth='sm'>
                <Typography variant='h5' paragraph>Лидерборд:</Typography>
                {Object.entries(sortedLeaderboard).map((item: any) => {
                    return (
                        <Typography variant='subtitle1' paragraph className={classes.playerContainer}
                                    key={item[0]}>
                            {item[1][0]}: {item[1][1]}
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