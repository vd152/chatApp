var express = require('express');
var  app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var usernames = [];

app.use(express.static(__dirname + '/public'));


app.get('/', (req,res)=>{
    res.sendFile(__dirname + '/views/index.html'); 
});

io.sockets.on('connection', (socket)=>{
    console.log("socket connected");
    //new user
    socket.on('new user', function(data,callback){
        if(usernames.indexOf(data) != -1){
            callback(false);
        }else{
            callback(true);
            socket.username = data;
            usernames.push(socket.username);
            updateUsername();
        }
    });
    // update username
    function updateUsername(){
        io.sockets.emit('usernames', usernames);
    }
    //send message
    socket.on('send message', (data)=>{
        io.sockets.emit('new message', {msg: data, user: socket.username});
    });
    //disconnect
    socket.on('disconnect', function(data){
        if(!socket.username){
            return;
        }
        usernames.splice(usernames.indexOf(socket.username), 1);
        updateUsername();
    })
});

server.listen(process.env.PORT || 3000, ()=>{
    console.log("Server started!");
})