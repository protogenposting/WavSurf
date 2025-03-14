class Session
{ 
    constructor(_username,_key)
    {
        this.username = _username
        this.key = _key
        this.minutesLeft = 10 //this value ticks down and is reset every time the user does something, if it hits zero remove it from the sessions
    }
}

class IPEntry
{ 
    constructor(_ip,_timeUntilReset)
    {
        this.ip = _ip
        this.timeUntilReset = _timeUntilReset
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

/**
 * Finds the amount in the last 5 minutes an ip has sent requests
 * @param {*} _ip hthe ip to check
 * @returns the session key
 */
function IpAmount(_ip) {
    let result = 0;
    ips.forEach(element => {
        if(_ip.match(element.ip))
        {
            result++
        }
    });
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

//these are the current active sessions, stored in memory since they're not that important
const currentSessions = [

]

const ips = [

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
        tagID INTEGER PRIMARY KEY UNIQUE,
        tagName STRING NOT NULL,
        type INTEGER NOT NULL
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
        songID INTEGER PRIMARY KEY UNIQUE,
        songName STRING NOT NULL,
        link STRING NOT NULL
    );
    CREATE TABLE IF NOT EXISTS songTags (
        id INTEGER PRIMARY KEY UNIQUE,
        songID INTEGER NOT NULL,
        tagID INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tagChildren (
        id INTEGER PRIMARY KEY UNIQUE,
        tagID INTEGER NOT NULL,
        childID INTEGER NOT NULL,
        layer INTEGER NOT NULL
    );
`;

db.exec(query)

function addUser(name, username, password, rank) {
    const addData = db.prepare("INSERT INTO users (name, username, password, rank) VALUES (?,?,?,?)")

    let result = addData.run(name,username,password,rank)

    return result
}

function addTag(tagName, type, parents) {
    const addData = db.prepare("INSERT INTO tags (tagName, type) VALUES (?,?)")
    let result = addData.run(tagName, type);

    let parentLength = parents.length

    for(var i = 0; i < parents.length; i++)
    {
        let parentParents = db.prepare('SELECT * FROM tagChildren WHERE childID = ?').all(parents[i]);

        for(var o = 0; o < parentParents.length; o++)
        {
            if(parents.indexOf(parentParents[o].tagID) <= -1)
            {
                parents.push(parentParents[o].tagID)
            }
        }

        let directChild = 0

        if(i < parentLength)
        {
            directChild = 1
        }

        const addData = db.prepare("INSERT INTO tagChildren (tagID, childID, layer) VALUES (?,?,?)")
        addData.run(parents[i],result.lastInsertRowid,directChild); 
    }
}

function addPost(songName, link, tags) {
    const addData = db.prepare("INSERT INTO posts (songName, link) VALUES (?, ?)");
    let result = addData.run(songName, link);
    for(var i = 0; i < tags.length; i++)
    {
        let parentTags = db.prepare('SELECT * FROM tagChildren WHERE childID = ?').all(tags[i]);

        for(var o = 0; o < parentTags.length; o++)
        {
            if(tags.indexOf(parentTags[o].tagID) <= -1)
            {
                tags.push(parentTags[o].tagID)
            }
        }

        const addData = db.prepare("INSERT INTO songTags (tagID, songID) VALUES (?,?)")
        addData.run(tags[i],result.lastInsertRowid);
    }
}

function populate() {
    addUser('Oli', 'Oliver', 'ownerLol', 3);
    addUser('Tiger', 'Tiger', 'ownerLol', 3);
    addUser('Carson', 'Carson', 'ownerLol', 3);
    addUser('Bob', 'BobRoss', 'bestpainter', 1);
    addUser('God', 'RealGod123', 'password', 2);
    addUser('AlanWalker', 'AlanWalker', 'TheSpectre', 1);
    addUser('PeterGriffin', 'PeterGriffinFromFamilyGuy', 'simposnssucks', 1);
    addUser('HomerSimpson', 'HomerSimpsonReal', 'familyguysucks', 1);
    addUser('RandomMod', 'RandomMod', 'modmod', 2);
    addUser('randomUSER', 'RandomUser', 'guyyes', 1);
    addUser('personyes', 'personperson', 'yeyaye', 1);
    addUser('justamod', 'justamod', 'modyesyes', 2);

    // id = 1
    addTag('Rock', 1, []);
    // id = 2
    addTag('Rap', 1, []);
    //id = 3
    addTag('Pop', 1, []);
    //id = 4
    addTag('HipHop', 1, []);
    //id = 5
    addTag('IndieRock', 1, [1,14]);
    //id = 6
    addTag('AlternativeRock', 1, [1]);
    //id = 7
    addTag('EDM', 1, [9]);
    //id = 8
    addTag('Dubstep', 1, [9]);
    //id = 9
    addTag('Electronic', 1, []);
    //id = 10
    addTag('DnB', 1, [9]);
    //id = 11
    addTag('Vaporwave', 1 ,[9]);
    //id = 12
    addTag('Synthwave', 1, [9]);
    //id = 13
    addTag('GrungeRock', 1, [1]);
    //id = 14
    addTag('Indie', 1, []);
    //id = 15
    addTag('AlternativeIndie', 1, [1]);
    //id = 16
    addTag('Drumstep', 1, [10,8]);
    //id = 17
    addTag('Deadmau5', 0, []);
    //id = 18
    addTag('Rob Swire', 0, []);
    //id = 19
    addTag('House', 1, [9]);
    //id = 20
    addTag('Hardbass', 1, [19]);
    //id = 21
    addTag('Metal', 1, [1]);
    //id = 22
    addTag('Lyrics', 2, []);
    //id = 23
    addTag('Vocaloid', 2, [22]);
    //id = 24
    addTag('Breakcore', 1, [9]);
    //id = 25
    addTag('Remix', 2, []);
    //id = 26
    addTag('Hardcore', 1, [9]);
    //id = 27
    addTag('T+Pazolite', 0, []);
    //id = 28
    addTag('Wayne Lytle', 0, []);
    //id = 29
    addTag('Kurorak', 0, []);
    //id = 30
    addTag('Donk', 1, [19]);
    //id = 31
    addTag('Swing', 1, []);
    //id = 32
    addTag('Electroswing', 1, [31,9]);
    //id = 33
    addTag('Tanger', 0, []);
    //id = 34
    addTag('Toriena', 0, []);
    //id = 35
    addTag('Speedcore', 1, [10]);
    //id = 36
    addTag('Dirty Androids', 0, []);
    //id = 37
    addTag('Orchestral', 1, []);
    //id = 38
    addTag('Extratonal', 1, [35]);
    //id = 39
    addTag('Nerdcore', 1, []);
    //id = 40
    addTag('Future Funk', 1, [11]);
    //id = 41
    addTag('Game Soundtrack', 2, []);
    //id = 42
    addTag('Beatmania IIDX', 2, [41]);
    //id = 43
    addTag('Wacca', 2, [41]);
    //id = 44
    addTag('Dancerush Stardom', 2, [41]);
    //id = 45
    addTag('Vivid/Stasis', 2, [41]);
    //id = 46
    addTag("Friday Night Funkin'", 2, [41]);
    //id = 47
    addTag("Celeste", 2, [41]);
    //id = 48
    addTag("Celeste Strawberry Jam", 2, [47]);
    //id = 49
    addTag("BeanJammin", 0, []);
    //id = 50
    addTag('Chiptune', 1, [9]);
    //id = 51
    addTag("KAERRA", 0, []);
    //id = 52
    addTag('Techno', 1, [9]);
    //id = 53
    addTag("Matt Sexton", 0, []);
    //id = 54
    addTag("Original Kyle", 0, []);
    //id = 55
    addTag("Aidan", 0, []);
    //id = 56
    addTag("Lena Raine", 0, []);
    //id = 57
    addTag("Grandaddy", 0, []);
    //id = 58
    addTag("Kobaryo", 0, []);
    //id = 59
    addTag("LamazeP", 0, []);
    //id = 60
    addTag("32ki", 0, []);
    //id = 61
    addTag("JamieP", 0, []);
    //id = 62
    addTag("Alisticious", 0, []);

    addPost('Ghosts n Stuff', 'pb-EwykPTv8',[7,17,18,22]);
    addPost('My Heart', 'jK2aIUmmdP4',[16]);
    addPost('Faded', '60ItHLz5WEA',[7,22]);
    addPost('Force', 'lqYQXIt4SpA',[7]);
    addPost('I Remember', '3UzvQowg9Po',[7,22,17]);
    addPost('Devil Town', 'KvaxYUfGHnk',[1,5,22]);
    addPost('Beird', 'fsrc_njfRTM',[3,22]);
    addPost('Macintosh plus 2k17', 'CBIGJohVMgw',[11,22]);
    addPost('Summer Is Over (Fury Weekend Remix)', 'L4eE_vvmo2k',[12,22]);
    addPost('Labyrinth', 'MdAzl3sOwmY',[2,9,22]);
    addPost('宇宙ステーションのレベル7', 'QB4uxDo4FXQ',[3,9,22]);
    addPost('Disco Panzer', 'uRSAatLI2QY',[20,22]);
    addPost('WFLYTD', 'uYkjSw3zb2M',[21,9,22]);
    addPost('ROT FOR CLOUT', '_AjJZEcMdww',[9,23,61]);
    addPost('Tatu Paradox', 'rzm4njnXJFE',[24,25,22]);
    addPost('T+ VS SHARK', '1v0hP5DuAZ8',[26,27,43]);
    addPost('More Bells And Wistles', 'qSdR4gFumps',[9,28,37]);
    addPost('Pyromania', '89v7_lyItwk',[26,29,45]);
    addPost('Donkey Donk', 'rnisur_Ejck',[30,42]);
    addPost('Garakuta Doll Play', 'V70SUqD6n14',[32,25,33]);
    addPost('BIKE', '6v98TpTscaw',[16,33]);
    addPost('めでてえ', 'ilzoLbT-yoc',[35,34,42]);
    addPost('Fiery Stallion', 'Xn9ZF8BtQu8',[12,1,36,42]);
    addPost('Meltdown', '06nVFlRZ1B0',[7,44]);
    addPost('Pipe Dream', 'HmoUSSVSV7I',[9,28,37]);
    addPost('Drum Machine', '0bPU4bdMlqM',[9,28,37]);
    addPost('Acoustic Curves', 'i_6Z1VouytE',[9,28,37]);
    addPost('HYPER4ID', 'xYLkpQRe40I',[26,27]);
    addPost('CUE CUE RESCUE', '12ZnJtZJfAM',[42,26,34,22]);
    addPost('Passionfruit Pantheon (Apotheosis Mix)', 'd3_n5DB3wTs',[25,48,37,9,49]);
    addPost('Cyberstrider Madeline', 'rnbXze7uvjw',[48,12]);
    addPost('Puffed Out', '2eq93dyayy8',[48,9]);
    addPost('Heart of the Problem', 'GCfz9OYKtxE',[48,50,62]);
    addPost('Out of Time', '_Ta4cjgqd7c',[48,51,35]);
    addPost('kevintechnospam.wav', 'tlFlnAJogXs',[48,53,52]);
    addPost('Limitless', 'd3_n5DB3wTs',[37,35,48,54]);
    addPost('Shatter the Pantheon!', 'U4u3aCEAMks',[25,48,37,9,55]);
    addPost('Shattersong', 'J7SzMayyPvs',[48,37,9,55]);
    addPost('Resurrections', '1rwAvUvvQzQ',[47,37,9,56]);
    addPost('A.M. 180', 'pBQDfOpWfBI',[57,9,22,5]);
    addPost('HAL 30000', 'BC3VhlNGs64',[58,38]);
    addPost('Triple Baka', 'duPJqfKiA78',[59,23,3,1,9]);
    addPost('Mesmerizer', '19y8YTbvri8',[60,23,3,26]);
    addPost('Obsolete Meat', 'L2hzsXOT0Nc',[60,23,3,26]);
    addPost('CIRCUS PANIC!!!', '6kiQuUJWHuE',[60,23,32]);
    addPost('You’re Telling Me A SHRIMP Fried This Rice?!', 's742C0v5SFI',[9,23,61,3]);
    addPost('Cadmium Colors', '1U6qefKcOrg',[9,23,61,3]);
    addPost('Get Set Mind', 'hBYBKR9e6hs',[42,50,34,3]);
}

populate()

//this is ran at the start of every request
app.use((req, res,next) => {
    ips.push(new IPEntry(req.ip,2))
    console.log(ips)
    if(IpAmount(req.ip) < 1000)
    {
        next()
    }
});

const schedule = require('node-schedule');

// Schedule a job to run every minute
schedule.scheduleJob('* * * * *', () => {
    for(var i = 0; i < ips.length; i++) {
        ips[i].timeUntilReset--
        if(ips[i].timeUntilReset <= 0)
        {
            ips.splice(i, 1)
            i--
        }
    }
});

//#region front end page requests
app.get('/style.css',(req,res) => {
    res.sendFile(path.join(__dirname, '/index/style.css'))
})

app.get('/search',(req,res) => {
    res.sendFile(path.join(__dirname, '/index/search.html'))
})

app.get('/search/:search',(req,res) => {
    res.sendFile(path.join(__dirname, '/index/search.html'))
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

app.get('/',(req, res) => {
    res.sendFile(path.join(__dirname, '/index/main.html'))
})

app.get('/moderation',(req, res) => {
    res.sendFile(path.join(__dirname, '/index/moderation.html'))
})

app.get('/postEdit/:songID',(req, res) => {
    res.sendFile(path.join(__dirname, '/index/postEdit.html'))
})

app.get('/noAccess',(req, res) => {
    res.sendFile(path.join(__dirname, '/index/noAccess.html'))
})

app.get('/navbarScript.js',(req, res) => {
    res.setHeader("Content-Type","text/javascript")
    res.sendFile(path.join(__dirname, 'index/navbar/navbarScript.js'))
})

app.get('/navbar',(req, res) => {
    res.sendFile(path.join(__dirname, '/index/navbar/navbar.html'))
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
        const request = db.prepare("INSERT INTO tagQueue (tagData) VALUES (?)");

        //parse the result and add it
        let result = request.run(JSON.stringify(req.body.data))

        res.json(result)
    }else {
        res.sendStatus(401);
    }
})

//this request accepts a tag and add it to the main table
app.post(apiPath+'acceptTag/:id',(req,res) => {
    /*
    if(verifyRank(req.headers.authorization,2))
    {
        //get the tag
        const tagQuery = db.prepare('SELECT * FROM tagQueue WHERE id=?');
        const tag = tagQuery.get(req.params.id);

        //delete the tag from the database
        const deleteData = db.prepare("DELETE FROM tagQueue WHERE id=?");
        deleteData.run(req.params.id);

        //insert the tag into the database
        const tagData = JSON.parse(tag.tagData);
        addTag(tagData.name, tagData.type, JSON.stringify(tagData.parents));
    }
    */
    if(verifyRank(req.headers.authorization,2))
    {
        const tagQuery = db.prepare('SELECT * FROM tagQueue WHERE id=?');
        const tag = tagQuery.get(req.params.id);
    
        const deleteData = db.prepare("DELETE FROM tagQueue WHERE id=?");
        deleteData.run(req.params.id);
    
        const tagData = JSON.parse(tag.tagData);
        for(var i = 0; i < tagData.parents.length; i++)
        {
            tagData.parents[i] = db.prepare("SELECT * FROM tags WHERE tagName = ?").get(tagData.parents[i]).tagID;
        }
        addTag(tagData.name, tagData.type, tagData.parents);
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

        console.log(req.body.data)

        res.json(result)
    }else {
        res.sendStatus(401);
    }
})

//accept a post and add it to the main table
app.post(apiPath+'acceptPost/:id',(req,res) => {
    if(verifyRank(req.headers.authorization,2))
    {
        const postQuery = db.prepare('SELECT * FROM postQueue WHERE id=?');
        const post = postQuery.get(req.params.id);

        const deleteData = db.prepare("DELETE FROM postQueue WHERE id=?");
        deleteData.run(req.params.id);

        const postData = JSON.parse(post.postData);
        for(var i = 0; i < postData.tags.length; i++)
        {
            postData.tags[i] = db.prepare("SELECT * FROM tags WHERE tagName = ?").get(postData.tags[i]).tagID;
        }
        addPost(postData.songName, postData.link, postData.tags);
    }
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
    let result = addUser(req.body.name,req.body.username,req.body.password,0)

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
//this request gets every single tag
app.get(apiPath+'tags',(req,res) => {
    const tags = db.prepare('SELECT * FROM tags').all();

    console.log(tags);

    res.json(tags)
})

app.get(apiPath+'tagsOrdered',(req,res) => {
    const tags = db.prepare('SELECT * FROM tags ORDER BY tagName').all();

    console.log(tags);

    res.json(tags)
})

app.get(apiPath+'tagParents',(req,res) => {
    const tags = db.prepare('SELECT tags.tagID, tags.tagName FROM tags LEFT JOIN tagChildren ON tags.tagID = tagChildren.childID WHERE tagChildren.childID IS NULL').all();

    console.log(tags);

    res.json(tags)
})

//?
app.get(apiPath+'tags/:id',(req,res) => {
    const tags = db.prepare('SELECT * FROM tags WHERE tagID = ?').get(req.params.id);

    console.log(tags);

    res.json(tags)
})

//this request sends back tags starting with the letters you send
app.get(apiPath+'tagSimilar/:name',(req,res) => {
    var tags = db.prepare("SELECT * FROM tags WHERE tagName LIKE ? || '%'").all(req.params.name);

    console.log(tags);

    res.json(tags)
})

app.get(apiPath+'tagChildren/:id',(req,res) => {
    const tags = db.prepare('SELECT tags.tagID, tags.tagName FROM tags LEFT JOIN tagChildren ON tags.tagID = tagChildren.childID WHERE tagChildren.tagID IS ? AND tagChildren.layer IS ?').all(req.params.id,1);

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
    const posts = db.prepare('SELECT * FROM posts WHERE songID = ?').get(req.params.id);

    console.log(posts);

    res.json(posts);
})

//this request gives the data of a single post
app.get(apiPath+'postTags/:id',(req,res) => {
    const posts = db.prepare('SELECT * FROM songTags WHERE songID = ?').all(req.params.id);

    console.log(posts);

    res.json(posts);
})

//this request allows you to search for posts that fit specific search terms and tags.
app.post(apiPath+'postSearch',(req,res) => {
    var tagNames = [];
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

    search = search.replaceAll(" ","")

    let songQuery = `SELECT DISTINCT posts.songID, posts.songName, tags.tagName FROM posts INNER JOIN songTags ON songTags.songID = posts.songID INNER JOIN tags ON songTags.tagID = tags.tagID WHERE songName LIKE '%' || ? || '%'`

    if(tagNames.length > 0)
    {
        for(var i = 0; i < tagNames.length; i++)
        {
            let type = "AND ("
            if(i > 0)
            {
                type = "OR"
            }
            songQuery = songQuery + " " + type + " '" + tagNames[i] + "' = tags.tagName"
        }

        if(tagNames.length > 0)
        {
            songQuery = songQuery + ")"
        }

        songQuery = songQuery + " GROUP BY posts.songName HAVING COUNT(DISTINCT tags.tagName) = " + tagNames.length
    }
    else
    {
        songQuery = songQuery + " GROUP BY posts.songName"
    }
        
    console.log(songQuery)

    var receivedSongs = db.prepare(songQuery).all(search);

    console.log(receivedSongs)

    res.send(receivedSongs);
})
//#endregion

//this starts the server on the port
app.listen(port,() => {
    console.log(`Listening on port ${port}`)
})