const express = require('express');
const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);
const {v4:uuidV4} = require('uuid')


const PORT = 3001;

app.set('view engine','ejs'); // setting up the template as ejs
app.use(express.static('public')) // setup a static folder named 'public'


app.get('/',(req,res) =>{
    res.redirect(`/${uuidV4()}`); // create a random dynamic room id using the v4 function in uuid package
});

app.get('/:room',(req,res) =>{
    res.render('room',{roomId:req.params.room}) // by default the room file is searched by the project to be rendered in views folder 
});

io.on('connection', socket =>{
    // listen whenever a user joins a room
    socket.on('join-room', (roomId,userId) =>{
        // console.log('roomId, userId: ', roomId, userId)
        socket.join(roomId);
        // using to.broadcast.emit() function to broadcast the message to everyone but ourselves that we have connected/joined the room
        socket.to(roomId).emit('user-connected',userId);
        // socket.to(roomId).broadcast.emit()
        

        // handle the video lag that happens when the user leaves the room
        socket.on('disconnect', () =>{
            socket.to(roomId).emit('user-disconnected',userId);
        })
    })
});

server.listen(PORT);