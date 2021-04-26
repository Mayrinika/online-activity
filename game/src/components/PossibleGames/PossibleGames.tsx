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

interface PossibleGamesProps extends RouteComponentProps, WithStyles<typeof styles> {
}

interface PossibleGamesState {

}

class PossibleGames extends Component<PossibleGamesProps, PossibleGamesState> {
    render() {
        return(
            <div>Привет</div>
        );
    }
}

export default (withStyles(styles)(PossibleGames));