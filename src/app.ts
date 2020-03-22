import fastify from 'fastify'
import cors from 'cors'
import { Server, IncomingMessage, ServerResponse } from 'http'

const server: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify()

const opts = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          hello: {
            type: 'string'
          }
        }
      }
    }
  }
}

function getHelloHandler(_: fastify.FastifyRequest<IncomingMessage>,
  reply: fastify.FastifyReply<ServerResponse>): void {
  reply.header('Content-Type', 'application/json').code(200)
  reply.send({ hello: 'world' })
}

server.use(cors())
server.get('/', getHelloHandler)

server.listen(process.env.PORT, err => {
  if (err) throw err
  console.log(`server listening on ${process.env.PORT}`)
})