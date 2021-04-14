import React, {Component} from "react";
import {RouteComponentProps} from "react-router-dom";
import crocoImg from "../../img/cocodrilo.png";
//components
import {ApiContext} from "../Api/ApiProvider";
//utils
import getRoutes from "../../utils/routes";
import getDomRoutes from "../../utils/domRoutes";
import checkLogin from "../../utils/checkLogin";
//styles
import {withStyles, WithStyles} from "@material-ui/core/styles";
import {Button, Container, Grid, Typography, TextField} from '@material-ui/core';

const styles = (theme: { content: any; }) => (
    theme.content
);

interface SignupProps extends RouteComponentProps, WithStyles<typeof styles> {
    setAuthorized: () => void;
}

interface SignupState {
    name: string;
    password: string;
    possibleNames: string[];
    nameIsTaken: boolean;
}

class Signup extends Component<SignupProps, SignupState> {
    static contextType = ApiContext;

    constructor(props: SignupProps) {
        super(props);
        this.state = {
            name: '',
            password: '',
            possibleNames: [],
            nameIsTaken: false,
        };
    }

    async componentDidMount() {
        await this.getAllUsers();
        checkLogin(this.props.setAuthorized);
    }

    handleSignup = async (evt: React.ChangeEvent<HTMLFormElement>) => {
        evt.preventDefault();
        if (!this.state.nameIsTaken) {
            await this.addName();
            localStorage.setItem('playerName', this.state.name);
            this.setState({name: '', password: ''});
            await this.getAllUsers();
            this.props.setAuthorized();
            this.props.history.push(getDomRoutes().main);
        }
    };

    getAllUsers = async () => {
        const allUsers = await this.context.getAllUsers();
        this.setState({possibleNames: allUsers.map((name: { name: string, password: string }) => name.name)});
    };

    addName = async () => {
        const {name, password} = this.state;
        await this.context.checkAuthorization();
        await this.context.signup(name, password);
    };

    handleChange = (evt: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState((state) => ({
            ...state,
            [evt.target.name]: evt.target.value
        }));
    };

    handleNameChange = (evt: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState((state) => ({
            ...state,
            [evt.target.name]: evt.target.value
        }));
        if (this.state.possibleNames.includes(evt.target.value)) {
            this.setState({nameIsTaken: true});
        } else {
            this.setState({nameIsTaken: false});
        }
    };

    render() {
        const {classes} = this.props;
        const {nameIsTaken, name, password} = this.state;
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
                            Регистрация
                        </Typography>
                        <form onSubmit={this.handleSignup} className={classes.innerContainer}
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
                                onChange={this.handleNameChange}
                                value={name}
                            />
                            {nameIsTaken && <p>Извините, имя {name} уже занято</p>}
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
                                Зарегистрироваться
                            </Button>
                        </form>
                    </Grid>
                </Grid>
            </Container>
        );
    }
}

export default (withStyles(styles)(Signup));
