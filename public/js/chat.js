var socket = io.connect('/');

function chat(room) {
    socket.on('connected', function() {
        socket.json.emit('init', { 'room': room });
    });

    socket.on('message', function(data) {
        if (data.comment) {
            update(data.comment);
        }
    });
}
function send(room, name) {
    var data = $('#comment').val();

    socket.json.send({ 'room': room, 'data': name + ": " + data });
    update(name + ": " + data);

    $('#comment').val("");
}
function update(data) {
    var obj = $(document.createElement('div'));
    obj.html(data);
    $('#view').append(obj);
}

