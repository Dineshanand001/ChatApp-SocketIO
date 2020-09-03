const socket = io({transports: ['websocket'], upgrade: false});

const message = document.getElementById('message'),
      handle = document.getElementById('handle'),
      output = document.getElementById('output'),
      button = document.getElementById('button'),
      typing = document.getElementById('typing');
  
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