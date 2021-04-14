import React, {Component} from "react";
import {RouteComponentProps} from "react-router-dom";
//components
import {ApiContext} from "../Api/ApiProvider";
//utils
import getRoutes from "../../utils/routes";
import getDomRoutes from "../../utils/domRoutes";
import checkLogin from "../../utils/checkLogin";
//styles
import {withStyles, WithStyles} from "@material-ui/core/styles";
import {Button, Container, Grid, Typography, TextField} from '@material-ui/core';
import crocoImg from "../../img/cocodrilo.png";

const styles = (theme: { content: any; }) => (
    theme.content
);

interface LoginProps extends RouteComponentProps, WithStyles<typeof styles> {
    setAuthorized: () => void;
}

interface LoginState {
    name: string;
    password: string;
    isIncorrect: boolean;
}

class Login extends Component<LoginProps, LoginState> {
    static contextType = ApiContext;
    private _isMounted: boolean;

    constructor(props: LoginProps) {
        super(props);
        this.state = {
            name: '',
            password: '',
            isIncorrect: false,
        };
        this._isMounted = false;
    }

    async componentDidMount() {
        checkLogin(this.props.setAuthorized);
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleChange = (evt: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState((state) => ({
            ...state,
            [evt.target.name]: evt.target.value
        }));
    };
    handleLogin = async (evt: React.ChangeEvent<HTMLFormElement>) => {
        evt.preventDefault();
        await this.login();
        if (!this.state.isIncorrect) {
            localStorage.setItem('playerName', this.state.name);
            this.props.setAuthorized();
            this.props.history.push(getDomRoutes().main);
        }
        if (this._isMounted) {
            this.setState({name: '', password: ''});
        }
    };
    login = async () => {
        const {name, password} = this.state;
        await this.context.checkAuthorization();
        const response = await this.context.login(name, password);
        if (response.status === 501) {
            this.setState({isIncorrect: true});
        } else {
            this.setState({isIncorrect: false});
        }
    };

    render() {
        const {classes} = this.props;
        const {isIncorrect, name, password} = this.state;
        return (
            <Container className={classes.outerContainer} maxWidth='lg' style={{height: 500}}>
                <Grid container spacing={2} justify="center">
                    <Grid item xs={5}>
                        <div className={classes.imgContainer}>
                            <img className="Login-Img" src={crocoImg} alt="Крокодил"/>
                        </div>
                    </Grid>
                    <Grid item xs={5} className={classes.loginFormContainer}>
                        <Typography variant='h4' paragraph>
                            Вход
                        </Typography>
                        <form onSubmit={this.handleLogin} className={classes.innerContainer}
                              style={{paddingBottom: 16}}>
                            {isIncorrect && <p>Неправильный логин или пароль, попробуйте еще раз</p>}
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="name"
                                type="text"
                                label="Введите ваше имя"
                                name="name"
                                autoFocus
                                onChange={this.handleChange}
                                value={name}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="password"
                                type="password"
                                label="Введите пароль"
                                name="password"
                                onChange={this.handleChange}
                                value={password}
                            />
                            <Button
                                className={classes.button}
                                variant="contained"
                                color="primary"
                                type="submit"
                                size="large"
                            >
                                Войти
                            </Button>
                        </form>
                    </Grid>
                </Grid>
            </Container>
        );
    }
}

export default (withStyles(styles)(Login));