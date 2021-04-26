import React, {Component, ReactElement} from 'react';
import {Link} from 'react-router-dom';
//components
import {ApiContext} from "../Api/ApiProvider";
//utils
import getDomRoutes from "../../utils/domRoutes";
//styles
import './NavigationBar.css';
import {withStyles, WithStyles} from "@material-ui/core/styles";
import {Button, Container, AppBar, Toolbar, Typography} from '@material-ui/core';

const styles = (theme: { content: any; }) => (
    theme.content
);

interface NavigationBarProps extends WithStyles<typeof styles> {
}

interface NavigationBarState {
}

class NavigationBar extends React.Component<NavigationBarProps, NavigationBarState> {
    static contextType = ApiContext;

    renderForAuthorizedUser = (): ReactElement => {
        const {classes} = this.props;
        return (
            <>
                <Link to={getDomRoutes().suggestWord} className={classes.navLink + " menu__item"}>
                    <Button
                        className={classes.navButton}
                        variant="contained"
                        color="secondary"
                    >Предложить слово</Button>
                </Link>
                <Link to={getDomRoutes().userProfile} className={classes.navLink +" NavigationBar-Right menu__item"}>
                    <img src={this.context.user.avatar} alt="avatar" className="avatar"/>
                    <Typography variant='subtitle1'>{this.context.user.name}</Typography>
                </Link>
                <Button
                    className={classes.navButton}
                    variant="contained"
                    color="default"
                    onClick={this.context.logout}

                >Выйти</Button>
            </>
        );
    };

    renderForUnauthorizedUser = (): ReactElement => {
        const {classes} = this.props;
        return (
            <>
                <Link to={getDomRoutes().login} className={classes.navLink + " NavigationBar-Right menu__item"}>
                    <Button
                        className={classes.navButton}
                        variant="contained"
                        color="default"
                    >Войти</Button>
                </Link>
                <Link to={getDomRoutes().signup} className={classes.navLink + " menu__item"}>
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
        const {classes} = this.props;
        return (
            <AppBar className={classes.navBarContainer + " NavBar"}>
                <input id="menu__toggle" type="checkbox"/>
                <label className="menu__btn" htmlFor="menu__toggle">
                    <span></span>
                </label>
                <Toolbar className="menu__box">
                    <Link to={getDomRoutes().main} className={classes.navLink + " menu__item"}>
                        <Button
                            className={classes.navButton}
                            variant="contained"
                            color="secondary"
                        >Главная</Button>
                    </Link>
                    <Link to={getDomRoutes().leaderboard} className={classes.navLink + " menu__item"}>
                        <Button
                            className={classes.navButton}
                            variant="contained"
                            color="secondary"
                        >Лидерборд</Button>
                    </Link>
                    {this.context.user && this.renderForAuthorizedUser()}
                    {!this.context.user && this.renderForUnauthorizedUser()}
                </Toolbar>
            </AppBar>);
    }
}

export default (withStyles(styles)(NavigationBar));