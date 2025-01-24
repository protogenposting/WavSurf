//YO
//all the stuff in this file is just some basic stuff stolen from the timbre api, CHANGE THIS ASAP

const databaseName='app.db'

//load in the database
const db = require('better-sqlite3')(databaseName);

//load in express
const express = require('express');

//copying thing load
const fs = require('fs');

//pathhhhh yayyyy
const path = require('path');

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
        password STRING NOT NULL
    );
    CREATE TABLE IF NOT EXISTS levels (
        id INTEGER PRIMARY KEY UNIQUE,
        name STRING NOT NULL
    );
`;

db.exec(query)

app.get('/search',(req,res) => {
    res.sendFile(path.join(__dirname, '/index/search.html'))
})

//get all the users
app.get(apiPath+'users',(req,res) => {
    const users = db.prepare('SELECT * FROM users ORDER BY id DESC').all();

    console.log(users);

    res.json(users)
})

app.listen(port,() => {
    console.log(`Listening on port ${port}`)
})