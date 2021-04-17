import React, {Component} from "react";
import {RouteComponentProps} from "react-router-dom";
//components
import {ApiContext} from "../Api/ApiProvider";
//utils
import getDomRoutes from "../../utils/domRoutes";
//styles
import crocoImg from "../../img/cocodrilo.png";
import {withStyles, WithStyles} from "@material-ui/core/styles";
import {Button, Container, Grid, Typography, TextField} from '@material-ui/core';

const styles = (theme: { content: any; }) => (
    theme.content
);

interface LoginProps extends RouteComponentProps, WithStyles<typeof styles> {
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
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleChange = (evt: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState((state) => ({
            ...state,
            isIncorrect: false,
            [evt.target.name]: evt.target.value
        }));
    };
    handleLogin = async (evt: React.ChangeEvent<HTMLFormElement>) => {
        evt.preventDefault();
        await this.login();
        if (!this.state.isIncorrect) {
            localStorage.setItem('playerName', this.state.name);
            this.props.history.push(getDomRoutes().main);
        }
        if (this._isMounted) {
            this.setState({name: '', password: ''});
        }
    };
    login = async () => {
        const {name, password} = this.state;
        await this.context.checkAuthorization();
        const user = await this.context.login(name, password);
        if (user.error) {
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
                                error={isIncorrect}
                                helperText={isIncorrect ? 'Неверный логин или пароль' : ''}
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
                                error={isIncorrect}
                                helperText={isIncorrect ? 'Неверный логин или пароль' : ''}
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