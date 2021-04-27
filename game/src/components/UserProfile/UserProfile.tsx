import React, {Component, ReactElement} from 'react';
import {RouteComponentProps} from 'react-router-dom';
//components
import {ApiContext} from "../Api/ApiProvider";
//utils
//styles
import './UserProfile.css'
import {withStyles, WithStyles} from "@material-ui/core/styles";
import {Button, Container, TextField, Typography} from "@material-ui/core";
import {Player} from "../../utils/Types/types";

const styles = (theme: { content: any; }) => (
    theme.content
);

interface UserProfileProps extends RouteComponentProps, WithStyles<typeof styles> {
}

interface UserProfileState {
    isPasswordChanging: boolean;
    isAvatarChanging: boolean;
    oldPassword: string;
    newPassword: string;
    helperText: string;
    isIncorrect: boolean;
    newAvatar: string | null;
    avatarIsLoading: boolean;
    sortedLeaderboard: { player: Player, score: number }[];
}

interface ChangeEventHandler<HTMLInputElement> {
    target: HTMLInputElement & EventTarget;
}

class UserProfile extends Component<UserProfileProps, UserProfileState> {
    static contextType = ApiContext;
    constructor(props: UserProfileProps) {
        super(props);
        this.state = {
            isPasswordChanging: false,
            isAvatarChanging: false,
            oldPassword: '',
            newPassword: '',
            helperText: '',
            isIncorrect: false,
            newAvatar: null,
            avatarIsLoading: false,
            sortedLeaderboard: []
        };
    }
    async componentDidMount() {
        const sortedLeaderboard = await this.context.getLeaderboardDataFromServer();
        this.setState((state) => ({
            ...state,
            helperText: '',
            sortedLeaderboard: sortedLeaderboard
        }));
    }
    handleChange = (evt: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState((state) => ({
            ...state,
            [evt.target.name]: evt.target.value
        }));
    }
    handlePasswordChange = async (evt: React.ChangeEvent<HTMLFormElement>): Promise<void> => {
        evt.preventDefault();
        const {oldPassword, newPassword} = this.state;
        const success = await this.context.changePassword(oldPassword, newPassword, this.context.user ? this.context.user.name : undefined);
        this.setState((state) => ({
            ...state,
            helperText: '',
        }));
        if (success) {
            this.setState((state) => ({
                ...state,
                helperText: 'Пароль был успешно изменен',
                isPasswordChanging: false
            }));
        } else {
            this.setState((state) => ({
                ...state,
                isIncorrect: true
            }));
        }
        this.setState((state) => ({
            ...state,
            oldPassword: '',
            newPassword: ''
        }));
    }
    handleAvatarChange = async (evt: React.ChangeEvent<HTMLFormElement>): Promise<void> => {
        evt.preventDefault();
        const {oldPassword, newAvatar} = this.state;
        const user = await this.context.changeAvatar(oldPassword, newAvatar, this.context.user ? this.context.user.name : undefined);
        this.setState((state) => ({
            ...state,
            helperText: '',
        }));
        if (!user.error) {
            this.setState((state) => ({
                ...state,
                helperText: 'Аватар был успешно изменен',
                isAvatarChanging: false
            }));
        } else {
            this.setState((state) => ({
                ...state,
                isIncorrect: true
            }));
        }
        this.setState((state) => ({
            ...state,
            oldPassword: '',
            newPassword: ''
        }));
    }

    renderPasswordChange = (): ReactElement => {
        const {oldPassword, newPassword, isIncorrect} = this.state;
        const {classes} = this.props;
        return (
            <>
                <form onSubmit={this.handlePasswordChange}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        id="password"
                        type="password"
                        label="Введите старый пароль"
                        name="oldPassword"
                        autoFocus
                        onChange={this.handleChange}
                        value={oldPassword}
                        error={isIncorrect}
                        helperText={isIncorrect ? 'Неверный пароль' : ''}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        id="newPassword"
                        type="password"
                        label="Введите новый пароль"
                        name="newPassword"
                        onChange={this.handleChange}
                        value={newPassword}
                        error={isIncorrect}
                        helperText={isIncorrect ? 'Неверный пароль' : ''}
                    />
                    <Button
                        className={classes.button}
                        variant="contained"
                        color="primary"
                        type="submit"
                        size="large"
                    >
                        Изменить пароль
                    </Button>
                </form>
                <Button
                    className={classes.button}
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={()=>this.setState({isPasswordChanging: false})}
                >
                    Отмена
                </Button>
            </>
        );
    };

    renderAvatarChange = (): ReactElement => {
        const {oldPassword, isIncorrect, avatarIsLoading} = this.state;
        const {classes} = this.props;
        return (
            <>
                <form onSubmit={this.handleAvatarChange}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        id="password"
                        type="password"
                        label="Введите пароль"
                        name="oldPassword"
                        autoFocus
                        onChange={this.handleChange}
                        value={oldPassword}
                        error={isIncorrect}
                        helperText={isIncorrect ? 'Неверный пароль' : ''}
                    />
                    <input type="file" onChange={this.handleLoadAvatar}/>
                    <Button
                        className={classes.button}
                        variant="contained"
                        color="primary"
                        type="submit"
                        size="large"
                        disabled={avatarIsLoading && true}
                    >
                        Изменить аватар
                    </Button>
                </form>
                <Button
                    className={classes.button}
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={()=>this.setState({isAvatarChanging: false})}
                >
                    Отмена
                </Button>
            </>
        );
    };

    handleLoadAvatar = (evt: ChangeEventHandler<HTMLInputElement>): void => {
        this.setState({avatarIsLoading: true});
        const width = 50;
        const height = 50;
        const files = (evt.target as HTMLInputElement).files;
        let file;
        if (files && files.length) {
            file = files[0];
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const img = new Image();
                img.src = reader.result as string;
                img.onload = () => {
                    const elem = document.createElement('canvas');
                    elem.width = width;
                    elem.height = height;
                    const ctx = elem.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    const url = elem.toDataURL();
                    this.setState({newAvatar: url, avatarIsLoading: false});
                };
                reader.onerror = error => console.log(error);
            };
        }
    };

    render() {
        const {user} = this.context;
        const {classes} = this.props;
        const {isPasswordChanging, helperText, isAvatarChanging, sortedLeaderboard} = this.state;
        let currentUser;
        let position;
        let score;
        if (user) {
            currentUser = sortedLeaderboard.find((el: { player: Player, score: number }) => el.player.name === user.name);
        }
        if (currentUser) {
            position = sortedLeaderboard.indexOf(currentUser);
            if (position !== -1){
                score = currentUser.score;
            }
        }
        return (
            <Container className={classes.outerContainer + " Main"} maxWidth='md'>
                {user && <Typography variant='h4' paragraph>
                    Привет, <img src={user.avatar} alt='avatar' className="avatar UserProfile-Avatar"/> {user.name}!
                </Typography>}
                <Typography paragraph>
                    Ваша позиция в общем лидерборде: <span className="text-highlight">{position}</span>
                </Typography>
                <Typography paragraph>
                    Вы набрали всего: <span className="text-highlight">{score}</span> очков
                </Typography>
                <div>
                    {!isPasswordChanging && !isAvatarChanging && <Button
                        className={classes.button}
                        variant="contained"
                        color="primary"
                        type="submit"
                        size="large"
                        onClick={()=>this.setState({isPasswordChanging: true, helperText: ''})}
                    >
                        Сменить пароль
                    </Button>}
                    {isPasswordChanging && this.renderPasswordChange()}
                    {!isPasswordChanging && !isAvatarChanging && <Button
                        className={classes.button}
                        variant="contained"
                        color="primary"
                        type="submit"
                        size="large"
                        onClick={()=>this.setState({isAvatarChanging: true, helperText: ''})}
                    >
                        Сменить автар
                    </Button>}
                    {isAvatarChanging && this.renderAvatarChange()}
                </div>
                <Typography>{helperText}</Typography>
            </Container>
        );
    }
}
export default (withStyles(styles)(UserProfile));