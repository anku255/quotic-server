import fastify from 'fastify'
import { ApolloServer } from 'apollo-server-fastify';
import cors from 'cors'
import { IncomingMessage, ServerResponse } from 'http'
import graphqlSchema from './graphql/schema'
import './config/database';

const app = fastify({ logger: true })

const gqlServer = new ApolloServer({
  schema: graphqlSchema
});


// const opts = {
//   schema: {
//     response: {
//       200: {
//         type: 'object',
//         properties: {
//           hello: {
//             type: 'string'
//           }
//         }
//       }
//     }
//   }
// }

function getHelloHandler(_: fastify.FastifyRequest<IncomingMessage>,
  reply: fastify.FastifyReply<ServerResponse>): void {
  reply.header('Content-Type', 'application/json').code(200)
  reply.send({ hello: 'world' })
}

app.use(cors());
app.get('/', getHelloHandler);


(async (): Promise<void> => {
  try {
    await app.register(gqlServer.createHandler()).listen(process.env.PORT)
    app.log.info(`server listening on ${process.env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
})();



// app.listen(process.env.PORT, err => {
//   if (err) throw err
//   console.log(`server listening on ${process.env.PORT}`)
// })