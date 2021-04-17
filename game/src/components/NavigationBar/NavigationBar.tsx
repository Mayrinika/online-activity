import React, {Component} from 'react';
import {Link} from 'react-router-dom';
//components
import {ApiContext} from "../Api/ApiProvider";
//utils
import getDomRoutes from "../../utils/domRoutes";
//styles
import {withStyles, WithStyles} from "@material-ui/core/styles";
import {Button, Container, Grid, Typography, TextField, AppBar, Toolbar} from '@material-ui/core';
import checkLogin from "../../utils/checkLogin";
import {User} from "../../utils/Types/types";

const styles = (theme: { content: any; }) => (
    theme.content
);

interface NavigationBarProps extends WithStyles<typeof styles> {
    user?: User;
}

interface NavigationBarState {
}

class NavigationBar extends React.Component<NavigationBarProps, NavigationBarState> {
    //static contextType = ApiContext;

    renderForAuthorizedUser = () => {
        const {classes} = this.props;
        return (
            <>
                <Link to={getDomRoutes().suggestWord} className={classes.navLink}>
                    <Button
                        className={classes.navButton}
                        variant="contained"
                        color="secondary"
                    >Предложить слово</Button>
                </Link>
                <Link to={getDomRoutes().main} className={classes.navLink}>
                    <Button
                        className={classes.navButton}
                        variant="contained"
                        color="default"
                    >Выйти</Button>
                </Link>
            </>
        );
    };

    renderForUnauthorizedUser = () => {
        const {classes} = this.props;
        return (
            <>
                <Link to={getDomRoutes().login} className={classes.navLink}>
                    <Button
                        className={classes.navButton}
                        variant="contained"
                        color="default"
                    >Войти</Button>
                </Link>
                <Link to={getDomRoutes().signup} className={classes.navLink}>
                    <Button
                        className={classes.navButton}
                        variant="contained"
                        color="default"
                    >Зарегистрироваться</Button>
                </Link>
            </>
        );
    };

    render() {
        const {classes, user} = this.props;
        console.log(user);
        return (
            <AppBar className={classes.navBarContainer}>
                <Container>
                    <Toolbar>
                        <Link to={getDomRoutes().main} className={classes.navLink}>
                            <Button
                                className={classes.navButton}
                                variant="contained"
                                color="secondary"
                            >Главная</Button>
                        </Link>
                        <Link to={getDomRoutes().leaderboard} className={classes.navLink}>
                            <Button
                                className={classes.navButton}
                                variant="contained"
                                color="secondary"
                            >Лидерборд</Button>
                        </Link>
                        {user && this.renderForAuthorizedUser()}
                        {!user && this.renderForUnauthorizedUser()}
                    </Toolbar>
                </Container>
            </AppBar>);
    }
}

export default (withStyles(styles)(NavigationBar));