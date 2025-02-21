class Session
{ 
    constructor(_username,_key)
    {
        this.username = _username
        this.key = _key
        this.minutesLeft = 10 //this value ticks down and is reset every time the user does something, if it hits zero remove it from the sessions
    }
}

/**
 * verify if the session token and username match any of the other sessions, wip currently
 * @param {*} _token 
 * @param {*} _username 
 * @returns boolean of whether the session key is accurate or not
 */
function verifySessionKey(_key)
{
    console.log(_key)
    let returnsTrue = false;
    currentSessions.forEach(element => {
        if(_key.match(element.key))
        {
            returnsTrue = true
        }
    });
    return returnsTrue
}

/**
 * verify if the session token and username match any of the other sessions, wip currently
 * @param {*} _token 
 * @param {*} _username 
 * @returns boolean of whether the session key is accurate or not
 */
function verifyRank(_key,_rank)
{
    console.log(_key)
    let returnsTrue = false;
    currentSessions.forEach(element => {
        if(_key.match(element.key))
        {
            let user = db.prepare(`
                SELECT * FROM users WHERE username = ?
                `).get(element.username);
            
            if(user.rank >= _rank)
            {
                returnsTrue = true
            }
        }
    });
    return returnsTrue
}

/**
 * generates a random string based on length
 * @param {*} length how long the session key should be
 * @returns the session key
 */
function generateSessionKey(length) {
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

const currentSessions = [

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
        password STRING NOT NULL,
        rank INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY UNIQUE,
        tagName STRING NOT NULL,
        tagChildren STRING NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tagQueue (
        id INTEGER PRIMARY KEY UNIQUE,
        tagData STRING NOT NULL
    );
    CREATE TABLE IF NOT EXISTS postQueue (
        id INTEGER PRIMARY KEY UNIQUE,
        postData STRING NOT NULL
    );
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY UNIQUE,
        songName STRING NOT NULL,
        tags INTEGER [],
        links STRING [] NOT NULL
    );
`;

db.exec(query)

//defines a get request
app.get('/style.css',(req,res) => {
    res.sendFile(path.join(__dirname, '/index/style.css'))
})

//defines a get request
app.get('/search',(req,res) => {
    //this is sent after /search is called
    res.sendFile(path.join(__dirname, '/index/search.html'))
})

app.get('/postSearch',(req,res) => {
    res.sendFile(path.join(__dirname, '/index/postSearch.html'))
})

//defines a get request
app.get('/tagCreate',(req,res) => {
    res.sendFile(path.join(__dirname, '/index/tagCreate.html'))
})

app.get('/postCreate',(req,res) => {
    res.sendFile(path.join(__dirname, 'index/postCreate.html'))
})

app.get('/songView',(req,res) => {
    res.sendFile(path.join(__dirname, '/index/songView.html'))
})

app.get('/tagBrowse',(req,res) => {
    res.sendFile(path.join(__dirname, '/index/tagBrowse.html'))
})

app.get('/tagQueueInterface',(req,res) => {
    res.sendFile(path.join(__dirname, '/index/tagQueueInterface.html'))
})

app.get('/signUp',(req,res) => {
    res.sendFile(path.join(__dirname, '/index/signUp.html'))
})

app.get('/login',(req,res) => {
    res.sendFile(path.join(__dirname, '/index/login.html'))
})
//defines a get request
app.get('/postQueueInterface',(req, res) => {
    res.sendFile(path.join(__dirname, '/index/postQueueInterface.html'))
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
    if(verifySessionKey(req.headers.authorization))
    {
        const request = db.prepare("INSERT INTO tagQueue (tagData) VALUES (?)");

        console.log(req.body.data)

        let result = request.run(JSON.stringify(req.body.data))

        console.log(result);

        res.json(result)
    }
})

//accept a tag and add it to the main table
app.post(apiPath+'acceptTag/:id',(req,res) => {
    if(verifyRank(req.headers.authorization,2))
    {
        const tagQuery = db.prepare('SELECT * FROM tagQueue WHERE id = ?');

        const tag = tagQuery.get(req.params.id);

        const deleteData = db.prepare("DELETE FROM tagQueue WHERE id=?");
        const addData = db.prepare("INSERT INTO tags (tagName, tagChildren) VALUES (?,?)")

        deleteData.run(req.params.id);
        
        console.log(tag.tagData);

        const tagData = JSON.parse(tag.tagData);
        
        addData.run(tagData.name, JSON.stringify(tagData.children));

        //add the tag adding thing

        //const request = db.prepare("INSERT INTO tagQueue (tagData) VALUES (?)");

        //console.log(req.body.data)

        //let result = request.run(JSON.stringify(req.body.data))
    }
})

//deny a tag and remove it from the queue permentantly
app.post(apiPath+'denyTag/:id',(req,res) => {
    if(verifyRank(req.headers.authorization,2))
    {
        const insertData = db.prepare("DELETE FROM tagQueue WHERE id=?");
        
        var result = insertData.run(req.params.id)
    }
})

//#endregion

//#region post queue api calls

//get posts from the queue
app.get(apiPath+'postQueue',(req,res) => {
    const users = db.prepare('SELECT * FROM postQueue').all();

    console.log(users);

    res.json(users)
})

//add a new post to the queue
app.post(apiPath+'postQueue',(req,res) => {
    if(verifySessionKey(req.headers.authorization))
    {
        const request = db.prepare("INSERT INTO postQueue (postData) VALUES (?)");

        console.log(req.body.data)

        let result = request.run(JSON.stringify(req.body.data))

        console.log(result);

        res.json(result)
    }
})

//accept a post and add it to the main table
app.post(apiPath+'acceptPost/:id',(req,res) => {
    if(verifyRank(req.headers.authorization,2))
    {
        const postQuery = db.prepare('SELECT * FROM postQueue WHERE id=?');

        const post = postQuery.get(req.params.id);

        const deleteData = db.prepare("DELETE FROM postQueue WHERE id=?");
        const addData = db.prepare("INSERT INTO posts (songName, tags, links) VALUES (?,?,?)");

        deleteData.run(req.params.id);

        const postData = JSON.parse(post.postData);

        addData.run(postData.songName, postData.tags, postData.links);
    }

    //add the post adding thing

    //const request = db.prepare("INSERT INTO postQueue (postData) VALUES (?)");

    //console.log(req.body.data)

    //let result = request.run(JSON.stringify(req.body.data))
})

//deny a tag and remove it from the queue permentantly
app.post(apiPath+'denyPost/:id',(req,res) => {
    if(verifyRank(req.headers.authorization,2))
    {
        const insertData = db.prepare("DELETE FROM postQueue WHERE id=?");
        
        var result = insertData.run(req.params.id)
    }
})

//#endregion

//#region user api calls


//get all the users
app.get(apiPath+'users',(req,res) => {
    const users = db.prepare('SELECT * FROM users ORDER BY id DESC').all();

    users.forEach(element => {
        delete element.password
    });

    console.log(users);

    res.json(users)
})

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
    if(verifyRank(req.headers.authorization,2))
    {
        db.prepare(`DELETE * FROM users WHERE username = ?`).run();

        res.send("Ok did that");
    }
})

//create a user :3
app.post(apiPath+'newUser',(req,res) => {
    const addData = db.prepare("INSERT INTO users (name, username, password) VALUES (?,?,?)")
    
    console.log(req.body)

    let result;

    result = addData.run(req.body.name,req.body.username,req.body.password)

    res.json({result: result})
})

//create a login session
app.post(apiPath+'login',(req,res) => {
    console.log(req.body)

    const user = db.prepare(`
        SELECT * FROM users WHERE username = ? AND password = ?
        `).get(req.body.username,req.body.password);
    
    
    if(user == null)
    {
        var sessionID = "0"
        res.send({sessionID: sessionID})
    }
    else
    {
        var sessionID = generateSessionKey(120)
        while(currentSessions.indexOf(sessionID)>-1)
        {
            sessionID = generateSessionKey(120)
        }
        currentSessions.push(new Session(req.body.username,sessionID));
        res.send({sessionID: sessionID})
    }
})

//#endregion

//#region tag api calls
app.get(apiPath+'tags',(req,res) => {
    const tags = db.prepare('SELECT * FROM tags').all();

    console.log(tags);

    res.json(tags)
})

app.get(apiPath+'tags/:id',(req,res) => {
    const tags = db.prepare('SELECT * FROM tags WHERE id = ?').get(req.params.id);

    console.log(tags);

    res.json(tags)
})
//#endregion

//#region post api calls
app.get(apiPath+'posts',(req,res) => {
    const posts = db.prepare('SELECT * FROM posts').all();

    console.log(posts);

    res.json(posts);
})
//#endregion

app.listen(port,() => {
    console.log(`Listening on port ${port}`)
})