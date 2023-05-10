const express = require('express');
const WebSocket = require('ws');

const app = express();

app.use(express.json());

app.disable('x-powered-by')

const key = "TeHVyee453GSjdjuSHhdKSh3837dJS73j738Hdjh7838djhs389Hjshdh"
const CheckAuth = async function (req, res, next) {

    const header = req.headers.auth

    if (header) {

        if (header == key) {


            next()

        } else {
            res.status(404).send(
                {
                "Message": "Wrong key"
                }
            )
        }

    } else {
        res.status(404).send(
            {
            "Message": "No header auth"
            }
        )
    }

}

app.use(CheckAuth)

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`It Is ready to rock http://localhost:${PORT}`);
});


const wsServer = new WebSocket.Server({ server });

const clients = new Map();

wsServer.on('connection', (socket) => {
    
  console.log('WebSocket client connected.');


  socket.on('message', (message) => {

    var ms = message.toString("utf-8")

    if (!clients.has(socket)) {


        console.log("message from socket: ", ms)

      if (ms == key) {
        // Add the client to the map with authenticated status
        clients.set(socket, true);
        console.log('WebSocket client authenticated');

      } else {

        socket.close();
        console.log('WebSocket client authentication failed');
        
      }
    } else {

      console.log('Received WebSocket message:', ms);
    }
  });

  // Handle WebSocket connection close
  socket.on('close', () => {
    console.log('WebSocket client disconnected.');
  });
});

// Define a route for handling the GET request
app.post('/:case', (req, res) => {

  console.log("Got request")

  //const requestData = req.query.data;
  const requestCase = parseInt(req.params.case)

  const requestData = req.body;

  console.log("Case ", requestCase, ", Data ", requestData)

  //const requestData = "request";

  const id = Date.now()

  // Find a connected WebSocket client
  const socket = wsServer.clients.values().next().value;
  
  if (socket) {
    // Send the request data to the WebSocket client
    
    const message = JSON.stringify({"id": id,"ms": {case: requestCase, data: requestData}})

    socket.send(message);
    //socket.send(requestData);

    // Set up a one-time 'message' event listener to receive the response
    socket.once('message', (message) => {

        const ms = JSON.parse(message)

        console.log("message id: ", ms.id)

        if (ms.id == id) {

            // Send the response from the WebSocket client as the response to the GET request

            res.status(200).send(JSON.stringify(ms.ms));
        
        }


    });

  } else {

    res.status(500).send('No WebSocket client connected.');

  }
  

});

console.error()