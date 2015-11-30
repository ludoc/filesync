'use strict';

var io = require('socket.io');
var express = require('express');
var path = require('path');
var app = express();
var _ = require('lodash');

var logger = require('winston');
var config = require('./config')(logger);

var passport = require('passport');
var cookieParser = require('cookie-parser');
var session      = require('express-session');

var currentUser;

require('./oauth/passport')(passport);

app.use(cookieParser()); 

app.use(session({ secret: 'someSecretKeyHere' })); 
app.use(passport.initialize());
app.use(passport.session());
require('./oauth/route.js')(app, passport);
function isAuthenticated(req, res, next) {
  if(req.hasOwnProperty('user')){
    if (req.user.authenticated)
        return next();
    }
    res.redirect('/login');
}

app.get('/', isAuthenticated, function(req, res) {
  currentUser = req.user;
  res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static(path.resolve(__dirname, './public')));

var server = app.listen(config.server.port, function() {
  logger.info('Server listening on %s', config.server.port);
});

var sio = io(server);

sio.set('authorization', function(handshakeData, accept) {
  // @todo use something else than a private `query`
  handshakeData.isAdmin = handshakeData._query.access_token === config.auth.token;
  accept(null, true);
});

function Viewers(sio) {
  var data = [];

  function notifyChanges() {
    sio.emit('viewers:updated', data);
  }

  return {
    add: function add(nickname) {
      var idx = data.map(function(e) { return e.id; }).indexOf(nickname.id);
      var count = 1;
      if (idx != -1) {
        count++;
        data[idx].connectionNumbers = count;
      }
      else{
        data.push({id: nickname.id, name: nickname.name, email: nickname.email, authType: nickname.authType, connectionNumbers: count});
      }
      notifyChanges();
    },
    remove: function remove(nickname) {
      var idx = data.map(function(e) { return e.id; }).indexOf(nickname);
      if (idx > -1) {
        if(data[idx].connectionNumbers == 1){
          data.splice(idx, 1);
        }
        else {
          data[idx].connectionNumbers--;
        }
      }
      notifyChanges();
      console.log('-->', data);
    }
  };
}
function Messages(sio) {
  var data = [];

  function notifyChanges() {
    sio.emit('social:message', data);
  }

  return {
    add: function add(message) {
      data.push(message);
      notifyChanges();
    }
  };
}


var viewers = Viewers(sio);
var messages = Messages(sio);

// @todo extract in its own
sio.on('connection', function(socket) {

  // console.log('nouvelle connexion', socket.id);
  socket.on('viewer:new', function(nickname) {
    socket.nickname = currentUser.id;
    viewers.add(currentUser);
    console.log('new viewer with nickname %s',   socket.nickname, viewers);
  });
  socket.on('message:send', function(message) {
    console.log(message);
    messages.add(message);

  });

  socket.on('disconnect', function() {
    viewers.remove(socket.nickname);
    console.log('viewer disconnected %s\nremaining:', socket.nickname, viewers);
  });

  socket.on('file:changed', function() {
    if (!socket.conn.request.isAdmin) {
      // if the user is not admin
      // skip this
      return socket.emit('error:auth', 'Unauthorized :)');
    }

    // forward the event to everyone
    sio.emit.apply(sio, ['file:changed'].concat(_.toArray(arguments)));
  });

  socket.visibility = 'visible';

  socket.on('user-visibility:changed', function(state) {
    socket.visibility = state;
    sio.emit('users:visibility-states', getVisibilityCounts());
  });
});

function getVisibilityCounts() {
  return _.chain(sio.sockets.sockets).values().countBy('visibility').value();
}
