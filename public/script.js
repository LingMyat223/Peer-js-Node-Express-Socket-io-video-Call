const socket = io('/');
const videoGrid = document.getElementById("video_grid");
const myPeer = new Peer(undefined,{
    host:'/',
    port: '3001'
});
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};
navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
}).then((stream)=>{ // This stream is our video and audio
    addVideoStream(myVideo,stream);

    myPeer.on('call',(call)=>{
        call.answer(stream);

        const video = document.createElement('video');
        call.on('stream',(anotherUserStream)=>{// they send us back their vd stream
            addVideoStream(video,anotherUserStream);
        });
    });

    socket.on('user-connected',(userId)=>{
        connectToNewUser(userId,stream)
    });
}).catch((err)=>{
    console.log('Error');
});

socket.on('user-disconnected',(userId)=>{
    if(peers[userId]) peers[userId].close() ;
});

myPeer.on('open',(id)=>{ // id is user id
    socket.emit('join-room',ROOM_ID,id);

});

function connectToNewUser(userId,stream){
    const call = myPeer.call(userId, stream);// call from me
    const video = document.createElement('video');
    call.on('stream',(anotherUserStream)=>{// they send us back their vd stream
        addVideoStream(video,anotherUserStream);
    });
    call.on('close',()=>{
        video.remove();
    });

    peers[userId] = call;
}

function addVideoStream(video,stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata',()=>{
        video.play();//This is playing from js
    });
    videoGrid.append(video);
}

