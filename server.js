//Initiallising node modules
var express = require("express");
var jwt = require("jsonwebtoken");
var bodyParser = require("body-parser");
var app = express(); 
var port=process.env.PORT || 8081;
var path = require('path');
var http = require('http').createServer(app); 
var io = require("socket.io")(http);
let users = [];

let apiPrefix = '/api'
app.use(bodyParser())
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
// app.use(express.static(path.join(__dirname + "/app")));
app.use(express.static(path.join(__dirname + "/app/src")));
function checkAuth(req,res,next){
    next();
};
// console.log('process: '+process.env.backendUrl);
app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    // res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('*',(req,res)=>{
    res.status(200).render(path.join(__dirname + '/app/src/default'));
});

// app.post(apiPrefix + '/register',(req,res,next)=>{
//     let uname = req.body.username;
//     let gnd = req.body.gender;
//     let rnd = parseInt(Math.random() * 100000);
//     let found = users.map(u=>u.username).indexOf(uname);
//     if(uname == undefined || uname.toString().trim().length < 4){
//         res.status(400).json('Invalid');
//     }else if(found < 0){
//         let u = {
//             username: uname,
//             key:rnd,
//             gender:gnd
//         }
//         users.push(u)
//         res.status(200).json(u);
//     } else {
//         res.status(400).json('User Already Taken...')
//     }
// });
// app.post(apiPrefix + '/verify',(req,res,next)=>{
//     let u = req.body.username;
//     let k = req.body.key;
//     let found = users.map(u=>u.username).indexOf(u);
//     if (found < 0){
//         res.status(403).json('Please Login...')
//     } else if(users[found].key == k){
//         res.status(200).json('Success')
//     } else {
//         res.status(403).json('Please Login...')
//     }
// })

// app.post(apiPrefix + '/logout',(req,res)=>{
//     let username = req.body.username
//     let found = users.map(u=>u.username).indexOf(username);
//     if(found > -1){
//         users.splice(found, 1)
//         res.status(200).json('Success')
//     }else {
//         res.status(400).json('Invali Creds')
//     }
// })
////////////////////// SOCKET ////////////////////
var timer = 0;
var codename = 'default';
var notes = '';
io.on('connection',(socket) => {
    socket.on('chat', (data)=>{
        io.sockets.emit('chat',data);
    });
    socket.on('connectme',data=>{
        socket.emit('connected','Welcome ' + data.username.toLowerCase())
    });
    socket.on('setTimer', (data) => {
        let t = parseInt(data.time);
        if (Number.isInteger(t) && t >= 0 && data.codename){
            timer = t;
            codename = data.codename;
            notes = data.notes;
        }
    });
});
setInterval(()=> {
    timer > 0 ? timer-- : 0;
    if (timer < 1)
        codename = 'Default';
    let dataObj = {
        time:timer,
        codename: codename,
        notes:notes
    }
    io.sockets.emit('countdown', dataObj);
}, 1000);

http.listen(port,()=>{
    console.log('Server is Listening on port: ' + port);
})