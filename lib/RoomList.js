/*!
 * live-diag
 * Copyright(c) 2011 hekyou <ukasy4@gmail.com>
 * MIT Licensed
 */

module.exports = new RoomList;

function RoomList() {
    this.room_list = [];
}

RoomList.prototype.getRoom = function(room_name) {
    var room = null;

    for (var key in this.room_list) {
        if (this.room_list[key].name == room_name) {
            room = this.room_list[key];
            break;
        }
    }
    if (room === null) {
        room = new Room(room_name);
        this.room_list.push(room);
    }
    return room;
};

RoomList.prototype.getRoomCount = function() {
    return this.room_list.length;
};

RoomList.prototype.disconnectUser = function(client) {
    for (var room in this.room_list) {
        if (this.room_list[room].disconnectUser(client)) {
            if (this.room_list[room].user_list.length === 0) {
                this.room_list.splice(room, 1);
            }
            return;
        }
    }
};

RoomList.prototype.gc = function() {
    var expires = 2 * 3600000; // 2 hour
    var now = new Date().getTime();

    for (var room in this.room_list) {
        if ((now - room.lasttime) > expires) {
            this.room_list.splice(room, 1);
        }
    }
};

// Room Class

function Room(name) {
    this.name = name;
    this.lasttime = new Date().getTime();
    this.user_list = [];
    this.send_type_json = false;
    this.current_client_id = null;
}

Room.prototype.connectUser = function(client) {
    this.lasttime = new Date().getTime();
    this.current_client_id = client.id;

    for (var key in this.user_list) {
        if (this.user_list[key].id == client.id) {
            return;
        }
    }
    var user = new User(client);
    this.user_list.push(user);
};

Room.prototype.disconnectUser = function(client) {
    for (var key in this.user_list) {
        if (this.user_list[key].id == client.id) {
            this.user_list.splice(key, 1);
            return true;
        }
    }
    return false;
};

Room.prototype.send = function(data) {
    var key;

    if (this.send_type_json) {
        for (key in this.user_list) {
            if (this.user_list[key].id != this.current_client_id) {
                this.user_list[key].sendJson(data);
            }
        }
    }
    else {
        for (key in this.user_list) {
            if (this.user_list[key].id != this.current_client_id) {
                this.user_list[key].send(data);
            }
        }
    }
    this.send_type_json = false;
};

Room.prototype.emit = function(emit, data) {
    var key;

    if (this.send_type_json) {
        for (key in this.user_list) {
            if (this.user_list[key].id != this.current_client_id) {
                this.user_list[key].emitJson(emit, data);
            }
        }
    }
    else {
        for (key in this.user_list) {
            if (this.user_list[key].id != this.current_client_id) {
                this.user_list[key].emit(emit, data);
            }
        }
    }
    this.send_type_json = false;
};

Room.prototype.json = function() {
    this.send_type_json = true;
    return this;
};

// User Class

function User(client) {
    this.client = client;
    this.id = client.id;
    this.lasttime = new Date().getTime();
}

User.prototype.send = function(data) {
    this.client.send(data);
};

User.prototype.sendJson = function(data) {
    this.client.json.send(data);
};

User.prototype.emit = function(emit, data) {
    this.client.emit(emit, data);
};

User.prototype.emitJson = function(emit, data) {
    this.client.json.emit(emit, data);
};

