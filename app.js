//YO
//all the stuff in this file is just some basic stuff stolen from the timbre api, CHANGE THIS ASAP

const databaseName='app.db'

//load in the database
const db = require('better-sqlite3')(databaseName);

//load in express
const express = require('express');

//copying thing load
const fs = require('fs');

//activate express
const app = express();
app.use(express.json());
const port = 3000;
const apiPath='/api/'

//create the tables if they don't exist
const query = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY UNIQUE,
        name STRING NOT NULL,
        username STRING NOT NULL UNIQUE,
        password STRING NOT NULL,
        pp INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS levels (
        id INTEGER PRIMARY KEY UNIQUE,
        name STRING NOT NULL
    );
`;

db.exec(query)

app.get(apiPath+'users',(req,res) => {
    //SESSION KEY CODE, USE THIS SOMEWHERE ELSE LATER
    const session = JSON.parse(req.headers.session.toString())
    console.log(session)
    console.log(verify_session_key(session.session,session.username))
    if(verify_token(req.headers.authorization))
    {
        const users = db.prepare('SELECT * FROM users').all();

        console.log(users);

        remove_passwords(users)

        res.json({users: users})
    }
    else
    {
        res.send("nuh uh tell me the secret password!!!")
    }
})