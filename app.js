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
    CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY UNIQUE,
        tagName STRING NOT NULL,
        tagChildren INTEGER [] NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tagQue (
        id INTEGER PRIMARY KEY UNIQUE,
        tagData STRING NOT NULL
    );
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY UNIQUE,
        songName STRING NOT NULL,
        tags INTEGER [] NOT NULL,
        link STRING NOT NULL
    );
`;

db.exec(query)

//defines a get request
app.get('/search',(req,res) => {
    //this is sent after /search is called
    res.sendFile(path.join(__dirname, '/index/search.html'))
})

//defines a get request
app.get('/tagCreate',(req,res) => {
    //this is sent after /search is called
    res.sendFile(path.join(__dirname, '/index/tagCreate.html'))
})

//get all the users
app.get(apiPath+'users',(req,res) => {
    const users = db.prepare('SELECT * FROM users ORDER BY id DESC').all();

    console.log(users);

    res.json(users)
})

//#region tag que api calls

//get tags from the que
app.get(apiPath+'tagQue',(req,res) => {
    const users = db.prepare('SELECT * FROM tagQue').all();

    console.log(users);

    res.json(users)
})

//get tags from the que
app.post(apiPath+'tagQue',(req,res) => {
    const request = db.prepare("INSERT INTO tagQue (tagData) VALUES (?)");

    request.run(req.body.data)

    console.log(result);

    res.json(result)
})

//accept a tag
app.post(apiPath+'acceptTag/:id',(req,res) => {
    const tag = db.prepare('SELECT * FROM tagQue WHERE id=?').run(req.params.id);

    const deleteData = db.prepare("DELETE FROM tagQue WHERE id=?");

    var result = insertData.run(req.params.id)

    console.log(tag)

    //add the tag
})

//deny a tag
app.post(apiPath+'denyTag/:id',(req,res) => {
    const insertData = db.prepare("DELETE FROM tagQue WHERE id=?");
        
    var result = insertData.run(req.params.id)
})

//#endregion


app.listen(port,() => {
    console.log(`Listening on port ${port}`)
})