/**
 * Module dependencies.
 */

var express = require('express');
var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);
var room_list = require('./lib/RoomList');

var port = process.env.PORT || 3000;

// Configuration

app.configure(function() {
    app.set('views', __dirname + '/views');
    app.register('.html', require('ejs'));
    app.set('view engine', 'html');
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
    app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res) {
    res.redirect('/' + random_string(12));
});

app.get('/:room', function(req, res) {
    res.render('index', { layout: false, title: 'chatroom', port: port, room: req.params.room, name: random_string(5) });
});

app.listen(port);

// socket.io

io.sockets.on('connection', function(client) {
    client.emit('connected');

    client.on('init', function(req) {
        room_list.getRoom(req.room).connectUser(client);
    });

    client.on('message', function(req) {
        var room = room_list.getRoom(req.room);
        room.connectUser(client);

        room.json().send({ comment: req.data });
    });

    client.on('disconnect', function () {
        room_list.disconnectUser(client);
    });
});

// timer handler

var loop = function() {
    room_list.gc();
    setTimeout(loop, 8000); // 8 second
};
loop();

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

// function

function random_string(len) {
    var base = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    base = base.split('');
    var str = '';
    var count = base.length;
    for (var i = 0; i < len; i++) {
        str += base[Math.floor(Math.random() * count)];
    }
    return str;
}

