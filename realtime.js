
let io;
function init(server){ io = require('socket.io')(server); }
function push(data){ if(io) io.emit('update', data); }
module.exports = { init, push };
