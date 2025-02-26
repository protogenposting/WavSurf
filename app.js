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
 * verify if the session token exists
 * @param {*} _token 
 * @returns boolean of whether the session key is accurate or not
 */
function verifySessionKey(_key) {
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
 * verify if the session token exists and is attached to a user with high enough rank
 * @param {*} _token 
 * @param {*} _rank
 * @returns boolean of whether the session key fits the rank
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

//load fs, the file system library
const fs = require('fs');

//deletes database on load, delete this line later
if(fs.existsSync(databaseName)) {
    fs.unlinkSync(databaseName);
}


//load in the database
const db = require('better-sqlite3')(databaseName);

//load in express
const express = require('express');

//pathhhhh yayyyy
const path = require('path');

//?
const currentSessions = [

]

//activate express
const app = express();
app.use(express.json());
const port = 3000;
const apiPath='/api/'

/**
 * These tables are used to store a large amount of data.
 * The users table containts info on each user, including their rank
 * The tags table contains tags and their children. Children is a string of a json array.
 * The tagQueue table is where all the tags not added yet are stored.
 * The postQueue table is where the queued up posts are stored in.
 * the posts table has all the posts currently available.
 */
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

/**
 * this function just populates the database. Used for testing.
 */
function populate() {
    let query = `
        INSERT INTO users (name, username, password, rank) VALUES ('Oli', 'Oliver', 'ownerLol', 3);
        INSERT INTO users (name, username, password, rank) VALUES ('Tiger', 'Tiger', 'ownerLol', 3);
        INSERT INTO users (name, username, password, rank) VALUES ('Carson', 'Carson', 'ownerLol', 3);
        INSERT INTO users (name, username, password, rank) VALUES ('Bob', 'BobRoss', 'bestpainter', 1);
        INSERT INTO users (name, username, password, rank) VALUES ('God', 'RealGod123', 'password', 2);
        INSERT INTO users (name, username, password, rank) VALUES ('AlanWalker', 'AlanWalker', 'TheSpectre', 1);
        INSERT INTO users (name, username, password, rank) VALUES ('PeterGriffin', 'PeterGriffinFromFamilyGuy', 'simpsonssucks', 1);
        INSERT INTO users (name, username, password, rank) VALUES ('HomerSimpson', 'HomerSimpsonReal', 'familyguysucks', 1);
        INSERT INTO users (name, username, password, rank) VALUES ('RandomMod', 'RandomMod', 'modmod', 2);
        INSERT INTO users (name, username, password, rank) VALUES ('randomUSER', 'RandomUser', 'guyyes', 1);
        INSERT INTO users (name, username, password, rank) VALUES ('personyes', 'personperson', 'yeyaye', 1);
        INSERT INTO users (name, username, password, rank) VALUES ('justamod', 'justamod', 'modyesyes', 2);

        --id = 1
        INSERT INTO tags (tagName, tagChildren) VALUES ('Rock', '[5, 6, 13]'); 
        --id = 2
        INSERT INTO tags (tagName, tagChildren) VALUES ('Rap', '[]');
        --id = 3
        INSERT INTO tags (tagName, tagChildren) VALUES ('Pop', '[]');
        --id = 4
        INSERT INTO tags (tagName, tagChildren) VALUES ('HipHop', '[]');
        --id = 5
        INSERT INTO tags (tagName, tagChildren) VALUES ('IndieRock', '[]');
        --id = 6
        INSERT INTO tags (tagName, tagChildren) VALUES ('AlternativeRock', '[]');
        --id = 7
        INSERT INTO tags (tagName, tagChildren) VALUES ('EDM', '[]');
        --id = 8
        INSERT INTO tags (tagName, tagChildren) VALUES ('Dubstep', '[16]');
        --id = 9
        INSERT INTO tags (tagName, tagChildren) VALUES ('Electronic', '[7, 8, 10, 11, 12, 16]');
        --id = 10
        INSERT INTO tags (tagName, tagChildren) VALUES ('DnB', '[16]');
        --id = 11
        INSERT INTO tags (tagName, tagChildren) VALUES ('Vaporwave', '[]');
        --id = 12
        INSERT INTO tags (tagName, tagChildren) VALUES ('Synthwave', '[]');
        --id = 13
        INSERT INTO tags (tagName, tagChildren) VALUES ('GrungeRock', '[]');
        --id = 14
        INSERT INTO tags (tagName, tagChildren) VALUES ('Indie', '[5, 15]');
        --id = 15
        INSERT INTO tags (tagName, tagChildren) VALUES ('AlternativeIndie', '[]');
        --id = 16
        INSERT INTO tags (tagName, tagChildren) VALUES ('Drumstep', '[]');

        INSERT INTO posts (songName, tags, links) VALUES ('Ghosts N Stuff', '[7]', 'pb-EwykPTv8');
        INSERT INTO posts (songName, tags, links) VALUES ('My Heart', '[16]', 'jK2aIUmmdP4');
        INSERT INTO posts (songName, tags, links) VALUES ('Faded', '[7]', '60ItHLz5WEA');
        INSERT INTO posts (songName, tags, links) VALUES ('Force', '[7]', 'lqYQXIt4SpA');
        INSERT INTO posts (songName, tags, links) VALUES ('I Remember', '[7]', '3UzvQowg9Po');
        INSERT INTO posts (songName, tags, links) VALUES ('Devil Town', '[1, 5]', 'KvaxYUfGHnk');
        INSERT INTO posts (songName, tags, links) VALUES ('Beird', '[3]', 'fsrc_njfRTM');
        INSERT INTO posts (songName, tags, links) VALUES ('Macintosh plus 2k17', '[11]', 'CBIGJohVMgw');
        INSERT INTO posts (songName, tags, links) VALUES ('Summer Is Over (Fury Weekend Remix)', '[12]', 'L4eE_vvmo2k');
        INSERT INTO posts (songName, tags, links) VALUES ('Labyrinth', '[2, 9]', 'MdAzl3sOwmY');
        INSERT INTO posts (songName, tags, links) VALUES ('宇宙ステーションのレベル7', '[3, 9]', 'QB4uxDo4FXQ');
     `
    db.exec(query);
}

populate();

//#region front end page requests
app.get('/style.css',(req,res) => {
    res.sendFile(path.join(__dirname, '/index/style.css'))
})

app.get('/search',(req,res) => {
    res.sendFile(path.join(__dirname, '/index/search.html'))
})

app.get('/postSearch',(req,res) => {
    res.sendFile(path.join(__dirname, '/index/postSearch.html'))
})

app.get('/tagCreate',(req,res) => {
    res.sendFile(path.join(__dirname, '/index/tagCreate.html'))
})

app.get('/postCreate',(req,res) => {
    res.sendFile(path.join(__dirname, 'index/postCreate.html'))
})

app.get('/songView/:id',(req,res) => {
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

app.get('/postQueueInterface',(req, res) => {
    res.sendFile(path.join(__dirname, '/index/postQueueInterface.html'))
})

app.get('/moderation',(req, res) => {
    res.sendFile(path.join(__dirname, '/index/moderation.html'))
})

//#endregion

//#region tag queue api calls

//this request gets every entry from the tag queue
app.get(apiPath+'tagQueue',(req,res) => {
    const tags = db.prepare('SELECT * FROM tagQueue').all();

    console.log(tags);

    res.json(tags)
})

//this request adds a new entry to the tag queue.
app.post(apiPath+'tagQueue',(req,res) => {
    //verify that the session
    if(verifySessionKey(req.headers.authorization))
    {
        //
        const request = db.prepare("INSERT INTO tagQueue (tagData) VALUES (?)");

        //parse the result and add it
        let result = request.run(JSON.stringify(req.body.data))

        res.json(result)
    }
})

//this request accepts a tag and add it to the main table
app.post(apiPath+'acceptTag/:id',(req,res) => {
    if(verifyRank(req.headers.authorization,2))
    {
        //get the tag
        const tagQuery = db.prepare('SELECT * FROM tagQueue WHERE id = ?');
        const tag = tagQuery.get(req.params.id);

        //delete the tag from the database
        const deleteData = db.prepare("DELETE FROM tagQueue WHERE id=?");
        deleteData.run(req.params.id);

        //insert the tag into the database
        const addData = db.prepare("INSERT INTO tags (tagName, tagChildren) VALUES (?,?)")
        const tagData = JSON.parse(tag.tagData);
        addData.run(tagData.name, JSON.stringify(tagData.children));
    }
})

//this request denies a tag and removes it from the queue
app.post(apiPath+'denyTag/:id',(req,res) => {
    if(verifyRank(req.headers.authorization,2))
    {
        const insertData = db.prepare("DELETE FROM tagQueue WHERE id=?");
        
        var result = insertData.run(req.params.id)
    }
})

//#endregion

//#region post queue api calls

//this request gets posts from the queue
app.get(apiPath+'postQueue',(req,res) => {
    const users = db.prepare('SELECT * FROM postQueue').all();

    console.log(users);

    res.json(users)
})

//this request adds a new post to the queue if the user has a valid session key
app.post(apiPath+'postQueue',(req,res) => {
    //check if the session key is valid
    if(verifySessionKey(req.headers.authorization))
    {
        //insert data into queue
        const request = db.prepare("INSERT INTO postQueue (postData) VALUES (?)");

        let result = request.run(JSON.stringify(req.body.data))

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
    const addData = db.prepare("INSERT INTO users (name, username, password, rank) VALUES (?,?,?,?)")
    
    console.log(req.body)

    let result;

    result = addData.run(req.body.name,req.body.username,req.body.password,0)

    res.json({result: result})
})

//create a login session
app.post(apiPath+'login',(req,res) => {
    console.log(req.body)
    
    //verifySessionKey(req.headers.authorization)

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

//?
app.get(apiPath+'tags/:id',(req,res) => {
    const tags = db.prepare('SELECT * FROM tags WHERE id = ?').get(req.params.id);

    console.log(tags);

    res.json(tags)
})
//#endregion

//#region post api calls
//this request sends the data of every single post
app.get(apiPath+'posts',(req,res) => {
    const posts = db.prepare('SELECT * FROM posts').all();

    res.json(posts);
})

//this request gives the data of a single post
app.get(apiPath+'post/:id',(req,res) => {
    const posts = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);

    console.log(posts);

    res.json(posts);
})

//this request allows you to search for posts that fit specific search terms and tags. Wip by oliver.
app.post(apiPath+'postSearch',(req,res) => {
    var tagNames = [];
    var searchedIds = [];
    var search = req.body.search;
    var reading = false;
    var currentString = "";

    for (var i=0; i < search.length; i++) {
        var searchChar = search.charAt(i);
        if (searchChar == '"') {
            reading = !reading;
            if (!reading) {
                tagNames.push(currentString);
                currentString = "";
                
            }
            search = search.slice(0, i) + search.slice(i + 1);
            i--;
        }else if (reading) {
            currentString = currentString + searchChar;
            search = search.slice(0, i) + search.slice(i + 1);
            i--;
        }
    }
    
    const posts = db.prepare('SELECT * FROM posts').all();

    for (var i=0; i < tagNames.length; i++) {
        var compare = tagNames[i];
        var receivedIds = db.prepare("SELECT id FROM tags WHERE tagName = ?");
        searchedIds.push(receivedIds.get(compare));
    }

    for (var i=0; i < searchedIds.length; i++) {
        var compare = searchedIds[i];
        var receivedSong = db.prepare("SELECT songName FROM posts WHERE tags LIKE '%?%'");//okay so the LIKE operator DOES WORK but it only selects one of the songs and i dont know if it gets input correctly
        console.log(receivedSong.get(compare));
    }

    console.log(searchedIds);
    console.log(tagNames);
    console.log(search);
})
//#endregion

//?
app.listen(port,() => {
    console.log(`Listening on port ${port}`)
})