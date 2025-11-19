const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  const io = new Server(httpServer, {
    path: '/api/socket',
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('join-group', (groupId) => {
      socket.join(`group-${groupId}`)
      console.log(`Socket ${socket.id} joined group ${groupId}`)
    })

    socket.on('leave-group', (groupId) => {
      socket.leave(`group-${groupId}`)
      console.log(`Socket ${socket.id} left group ${groupId}`)
    })

    socket.on('send-message', (data) => {
      socket.to(`group-${data.groupId}`).emit('new-message', data.message)
    })

    socket.on('typing', (data) => {
      socket.to(`group-${data.groupId}`).emit('user-typing', {
        userId: data.userId,
        userName: data.userName,
      })
    })

    socket.on('stop-typing', (data) => {
      socket.to(`group-${data.groupId}`).emit('user-stopped-typing', {
        userId: data.userId,
      })
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})

