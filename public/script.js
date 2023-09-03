const socket = io('/')
// using peerjs to create peer connetions for creating rooms
// use command: peerjs --port 3002 in terminal to start the peer Server
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3002'
})

const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')
myVideo.muted = true // mute the current user to avoid echo i.e, If we join we done hear ourselves

const peers = {}

// send media audio and video
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true
  })
  .then(stream => {
    //   call the function to stream the video to the users
    addVideoStream(myVideo, stream)

    // get the connected user's video on your screen
    myPeer.on('call', call => {
      // by default answer the call
      call.answer(stream)

      // get the information to the current user as well and make the video of the connected user diplay on our screen as well
      // and let both the browsers communicate
      const video = document.createElement('video')
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
      })
    })

    // call the socket when new user connects
    socket.on('user-connected', userId => {
      // send the stream to the other user
      connectToNewUser(userId, stream)
    })
  })

// handle the video disconnect screen freeze on the browser screen using an event
socket.on('user-disconnected', userId => {
//   console.log('disconnected userId:', userId)
// remove the video of the person that left the room disconnected from the server socket
	if(peers[userId] ){ // check if the peer connection of the userId exists
		peers[userId].close()
	}
})

// when we connect with Peer Server and get back an Id run the code
myPeer.on('open', id => {
  // dynamically joining the room
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser (userId, stream) {
	// call the user using the peerjs package and exchange the audio and video via stream
	const call = myPeer.call(userId, stream)
	const video = document.createElement('video')
	call.on('stream', userVideoStream => {
	  addVideoStream(video, userVideoStream)
	})
  
	// when someone leaves the room remove the video
	call.on('close', () => {
	  video.remove()
	})
	
	peers[userId] = call;
  }

function addVideoStream (video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}


