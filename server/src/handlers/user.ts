import {v4 as uuidv4} from "uuid";
import bcrypt from "bcrypt";
import express from 'express';
import {User} from '../utils/types';
import db from "../db";
import {games} from "./game";

declare module 'express-session' {
    interface SessionData {
        user: User | null;
    }
}

export const getAllUsers = (req: express.Request, res: express.Response): void => {
    const users = db.getUsers();
    if (users)
        res.status(200).send(users);
    else
        res.status(404).send(`users not found`);
};

export const signup = async (req: express.Request, res: express.Response): Promise<void> => {
    const users = db.getUsers();
    if (!users) res.status(404).send(`users not found`);
    const {name, password, avatar} = req.body;
    const hash = await hashPassword(password);
    const user = {id: uuidv4(), name, password: hash, avatar};
    users.push(user);
    db.saveUsers(users);
    req.session.user = user;
    res.status(200).send(user);
};

export const getUserLoginData = (req: express.Request, res: express.Response): void => {
    const {user} = req.session;
    if (!user) {
        res.send({loggedIn: false});
    } else {
        res.send({loggedIn: true, user: user});
    }
};

export const login = async (req: express.Request, res: express.Response): Promise<void> => {
    const users = db.getUsers();
    if (!users) res.status(404).send(`users not found`);
    const {name, password} = req.body;
    const user = users.find((user: User) => user.name === name);
    if (!user) {
        res.send({error: true});
    } else {
        const valid = await bcrypt.compare(password, user.password);
        if (valid) {
            req.session.user = user;
            res.status(200).send(user);
        } else {
            res.send({error: true});
        }
    }
};

export const logout = async (req: express.Request, res: express.Response): Promise<void> => {
    req.session.user = null;
    res.status(200).send(null);
};

export const changePassword = async (req: express.Request, res: express.Response) => {
    const users = db.getUsers();
    const {oldPassword, newPassword, name} = req.body;
    const user = users.find((user: User) => user.name === name);
    if (!user) {
        res.send({success: false});
    } else {
        const valid = await bcrypt.compare(oldPassword, user.password);
        if (valid) {
            const hash = await hashPassword(newPassword);
            user.password = hash;
            db.saveUsers(users);
            res.send({success: true});
        } else {
            res.send({success: false});
        }
    }
};

export const changeAvatar = async (req: express.Request, res: express.Response) => {
    const users = db.getUsers();
    const {oldPassword, newAvatar, name} = req.body;
    const user = users.find((user: User) => user.name === name);
    if (!user) {
        res.send({error: true});
    } else {
        const valid = await bcrypt.compare(oldPassword, user.password);
        if (valid) {
            user.avatar = newAvatar;
            req.session.user = user;
            db.saveUsers(users);
            res.send(user);
        } else {
            res.send({error: true});
        }
    }
};

const hashPassword = async (password: string): Promise<string> => {
    const hash = await bcrypt.hash(password, 12);
    return hash;
};