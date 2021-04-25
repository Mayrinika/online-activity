import {v4 as uuidv4} from "uuid";
import bcrypt from "bcrypt";
import express from 'express';
import {User} from '../utils/types';
import db from "../db";

declare module 'express-session' {
    interface SessionData {
        user: User | null;
    }
}

export const getAllUsers = (req: express.Request, res: express.Response) => {
    const users = db.getUsers();
    res.status(200).send(users);
};

export const signup = async (req: express.Request, res: express.Response) => {
    const users = db.getUsers();
    const {name, password, avatar} = req.body;
    const hash = await hashPassword(password);
    const user = {id: uuidv4(), name, password: hash, avatar};
    users.push(user);
    db.saveUsers(users);
    req.session.user = user;
    res.status(200).send(user);
};

export const getUserLoginData = (req: express.Request, res: express.Response) => {
    const {user} = req.session;
    if (!user) {
        res.send({loggedIn: false});
    } else {
        res.send({loggedIn: true, user: user});
    }
};

export const login = async (req: express.Request, res: express.Response) => {
    const users = db.getUsers();
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

export const logout = async (req: express.Request, res: express.Response) => {
    req.session.user = null;
    res.status(200).send(null);
};

const hashPassword = async (password: string): Promise<string> => {
    const hash = await bcrypt.hash(password, 12);
    return hash;
};