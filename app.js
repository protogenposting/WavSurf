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
    CREATE TABLE IF NOT EXISTS tagQueue (
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

app.get('/postCreate',(req,res) => {
    res.sendFile(path.join(__dirname, 'index/postCreate.html'))
})

app.get('/songView',(req,res) => {
    res.sendFile(path.join(__dirname, '/index/songView.html'))
})

//get all the users
app.get(apiPath+'users',(req,res) => {
    const users = db.prepare('SELECT * FROM users ORDER BY id DESC').all();

    console.log(users);

    res.json(users)
})

//#region tag queue api calls

//get tags from the queue
app.get(apiPath+'tagQueue',(req,res) => {
    const users = db.prepare('SELECT * FROM tagQueue').all();

    console.log(users);

    res.json(users)
})

//add a new tag to the queue
app.post(apiPath+'tagQueue',(req,res) => {
    const request = db.prepare("INSERT INTO tagQueue (tagData) VALUES (?)");

    console.log(req.body.data)

    let result = request.run(JSON.stringify(req.body.data))

    console.log(result);

    res.json(result)
})

//accept a tag and add it to the main table
app.post(apiPath+'acceptTag/:id',(req,res) => {
    const tag = db.prepare('SELECT * FROM tagQueue WHERE id=?').run(req.params.id);

    const deleteData = db.prepare("DELETE FROM tagQueue WHERE id=?");

    var result = insertData.run(req.params.id)

    console.log(tag)

    //add the tag
})

//deny a tag and remove it from the queue permentantly
app.post(apiPath+'denyTag/:id',(req,res) => {
    const insertData = db.prepare("DELETE FROM tagQueue WHERE id=?");
        
    var result = insertData.run(req.params.id)
})

//#endregion

//add a new user
app.post(apiPath+'newUser',(req,res) => {
	console.log(req.body)

	if(req.body.name == "" || req.body.password == "")
	{
		req.send("UNIQUE")
		return 0
	}
	
	const insertData = db.prepare("INSERT INTO users (name, username, password) VALUES (?, ?, ?)");
	
	var result = insertData.run(req.body.name,req.body.username,req.body.password)
	
	res.send(result)
})


app.listen(port,() => {
    console.log(`Listening on port ${port}`)
})