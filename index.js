const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const mongoose = require('mongoose')
const DataModel = require('./models/Data')
require('dotenv').config()
const { error } = require('console')
const cors = require('cors')

mongoose.connect(
  'mongodb+srv://admin:admin123@cluster0.uhlyr.mongodb.net/Code-App?retryWrites=true&w=majority',
  { useNewUrlParser: true }
)
//Port from environment variable or default - 3000
const port = process.env.PORT || 8080

//Setting up express and adding socketIo middleware
const app = express()
app.use(
  cors({
    origin: 'https://silly-kalam-8f7a8b.netlify.app',
  })
)
app.use(express.json())
const server = http.createServer(app)
//const io = socketIo(server)
const io = socketIo(server, {
  cors: {
    origin: 'https://silly-kalam-8f7a8b.netlify.app',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
//console.log(io)
//Setting up a socket with the namespace "connection" for new sockets
app.get('/read', async (req, res) => {
  const data = await DataModel.find({}, (err, response) => {
    if (err) throw error
    else {
      res.send(response)
    }
  })
})
app.get('/room/:id', async (req, res) => {
  const roomId = req.params.id

  await DataModel.findOne({ roomId: roomId }, (error, response) => {
    if (error) throw error
    else {
      res.send(response)
    }
  })
})
app.post('/room/:id', async (req, res) => {
  //console.log('req', req)
  //console.log('req.body', req.body)
  //console.log(req.params.id)
  const roomId = req.params.id
  const text = req.body.text
  const langauge = req.body.langauge
  const theme = req.body.theme
  const input = req.body.input
  const output = req.body.output

  await DataModel.updateOne(
    { roomId: roomId },
    [
      {
        $set: {
          roomId: roomId,
          text: text,
          langauge: langauge,
          theme: theme,
          input: input,
          output: output,
        },
      },
    ],
    { upsert: true }
  )
})
io.on('connection', (socket) => {
  console.log('New client connected')
  socket.on('join', (room) => {
    console.log('room', room)
    socket.join(room)
  })

  //Here we listen on a new namespace called "incoming data"
  socket.on('data', (data) => {
    //Here we broadcast it out to all other sockets EXCLUDING the socket which sent us the data
    console.log('data', data)
    socket.to(data.room).emit('data', { data: data })
  })

  //A special namespace "disconnect" for when a client disconnects
  socket.on('disconnect', () => console.log('Client disconnected'))
})

server.listen(port, () => console.log(`Listening on port ${port}`))
