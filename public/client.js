const socket = io({transports: ['websocket'], upgrade: false});
const peer = new Peer();

const message = document.getElementById('message'),
      handle = document.getElementById('handle'),
      output = document.getElementById('output'),
      button = document.getElementById('button'),
      typing = document.getElementById('typing');
  
//Typing Chat
//send typing event to all listener except typer..
message.addEventListener('keypress', () => {
    socket.emit('userTyping',handle.value);
});      

button.addEventListener('click', () => {
    socket.emit('userMessage', {
        handle: handle.value,
        message: message.value
    });
    document.getElementById('message').value = "";
});

socket.on('userMessageServer', (data) => {
    typing.innerHTML = "";
    output.innerHTML += '<p> <strong>' + data.handle + ': </strong>' + data.message + '</p>'
});

socket.on('userTyping', (data) => {
    typing.innerHTML = '<p> <em>' + data + ' is typing.. </em></p>';
});

//Video Chat

//Get the local Media Devices Connection
function getLocalVideoAudio(callbacks) {
    //let mediaStream = null
    //navigator.mediaDevices.getUserMedia = navigator.mediaDevices.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    //Deprecated navigator.getUserMedia
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    const constraints = {
        audio : true,
        video : true
    };
    //mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    navigator.getUserMedia(constraints, callbacks.success, callbacks.error);
    //receiveStream(mediaStream, 'lVideo');
}

function receiveStream(stream, elemid) {
    let video = document.getElementById(elemid);
    video.srcObject = stream;
    window.peer_stream = stream;
}

getLocalVideoAudio({
    success: function(stream) {
        window.localstream = stream;
        receiveStream(stream, 'lVideo');
    },
    error: function(err) {
        alert(err);
        console.log(err);
    }
})
//getLocalVideoAudio();

let conn;
let peer_id;

//Display Peer Id
peer.on('open', function() {
    document.getElementById('connectionId').innerHTML = peer.id;
});

peer.on('connection', (connection) => {
    conn = connection;
    console.log(connection);
    peer_id = connection.peer;
    document.getElementById('connId').value = peer_id;
});

peer.on('error', (err) => {
    alert(err);
    console.log(err);
});

document.getElementById('connButton').addEventListener('click', function() {
    peer_id = document.getElementById('connId').value;

    if(peer_id) {
        conn = peer.connect(peer_id);
    }else{
        alert('Enter a connection id');
        return false;
    }
});

peer.on('call', function(call) {
    window.focus(); 
    let acceptCall = confirm('Do you want to answer the call?');
    if(acceptCall){
        call.answer(window.localstream);
        call.on('stream', function(stream) {
            window.peer_stream = stream;
            receiveStream(stream, 'rVideo');
        });
        call.on('close', function(){
            alert('The call has ended');
        })
    }else{
        console.log('Call declined..');
    }
});

document.getElementById('callButton').addEventListener('click', function() {
    console.log('Calling a peer: ' + peer_id);
    console.log(peer);
    let call = peer.call(peer_id, window.localstream);
    call.on('stream', function(stream){
        window.peer_stream = stream;
        receiveStream(stream, 'rVideo');
    })
});
