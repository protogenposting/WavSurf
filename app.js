//YO
//all the stuff in this file is just some basic stuff stolen from the timbre api, CHANGE THIS ASAP

class Session
{ 
    constructor(_username,_key)
    {
        this.username = _username
        this.key = _key
    }
}

/**
 * verify if the session token and username match any of the other sessions, wip currently
 * @param {*} _token 
 * @param {*} _username 
 * @returns boolean of whether the session key is accurate or not
 */
function verify_session_key(_key,_username)
{
    console.log(_key)
    console.log(_username)
    let returnsTrue = false;
    currentSessions.forEach(element => {
        if(_key.match(element.key) && _username.match(element.username))
        {
            returnsTrue = true
        }
    });
    return returnsTrue
}

/**
 * Removes the password from all users returned in a list. Used so that you can't just get the passwords of every player.
 * @param {*} _users 
 */
function remove_passwords(_users)
{
    _users.forEach(element => {
        delete element.password
    });
}

/**
 * generates a random string based on length
 * @param {*} length how long the session key should be
 * @returns the session key
 */
function generate_session_key(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

const databaseName='app.db'

//load in the database
const db = require('better-sqlite3')(databaseName);

//load in express
const express = require('express');

//copying thing load
const fs = require('fs');

//pathhhhh yayyyy
const path = require('path');

const sessions = [

]

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

//defines a get request
app.get('/tagQueueInterface',(req,res) => {
    res.sendFile(path.join(__dirname, '/index/tagQueueInterface.html'))
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

    var result = deleteData.run(req.params.id);

    console.log(req.params.id);

    //add the tag adding thing

    //const request = db.prepare("INSERT INTO tagQueue (tagData) VALUES (?)");

    //console.log(req.body.data)

    //let result = request.run(JSON.stringify(req.body.data))
})

//deny a tag and remove it from the queue permentantly
app.post(apiPath+'denyTag/:id',(req,res) => {
    const insertData = db.prepare("DELETE FROM tagQueue WHERE id=?");
        
    var result = insertData.run(req.params.id)
})

//#endregion

//#region user api calls

//get a user by name
app.get(apiPath+'user/:name',(req,res) => {
    const user = db.prepare(`
        SELECT * FROM users WHERE username = ?
        `).get(req.params.name);

    console.log(user);

    delete user.password

    res.json({user: user})
})

//delete a user
app.delete(apiPath+'user/:name',(req,res) => {
    db.prepare(`DELETE * FROM users WHERE username = ?`).run();

    res.send("Ok did that");
})

//create a user :3
app.post(apiPath+'newUser',(req,res) => {
    console.log(req.body)

    if(req.body.name == "" || req.body.password == "")
    {
        req.send("UNIQUE")
        return 0
    }
    
    const insertData = db.prepare("INSERT INTO users (name, username, password, pp) VALUES (?, ?, ?, ?)");
    
    var result = insertData.run(req.body.name,req.body.username,req.body.password,0)
    
    res.send(result)
})

//create a login session
app.post(apiPath+'login',(req,res) => {
    console.log(req.body)
    
    const user = db.prepare(`
        SELECT * FROM users WHERE username = ? AND password = ?
        `).get(req.body.name,req.body.password);
    
    
    if(user == null)
    {
        var sessionID = "0"
        res.send({sessionID: sessionID})
    }
    else
    {
        var sessionID = generate_session_key(120)
        while(currentSessions.indexOf(sessionID)>-1)
        {
            sessionID = generate_session_key(120)
        }
        currentSessions.push(new Session(req.body.name,sessionID));
        res.send({sessionID: sessionID})
    }
})

//#endregion

app.listen(port,() => {
    console.log(`Listening on port ${port}`)
})