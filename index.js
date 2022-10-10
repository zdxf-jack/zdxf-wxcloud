const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const PORT = 3001
const controller = require('./controller')

var app = express();
app.use(bodyParser.json({limit: 52428800}));
app.use(bodyParser.urlencoded({parameterLimit: 1000000,limit: 52428800, extended: true}));

app.get('/', (req, res)=>{
  res.end('welcome!')
})
// route
app.post('/com/getlink', controller.getLink);

var server = http.createServer(app);

server.listen(PORT);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  var port=config.port;
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = (typeof port === 'string') ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors wi th friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
 function onListening() {
  var addr = server.address();
  var bind = (typeof addr === 'string') ? 'pipe ' + addr : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}

module.exports = app;