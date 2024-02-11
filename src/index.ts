import fastify from "fastify";
import { Server } from "socket.io";
import { boilatePlugins } from "./plugins/boilate.js";
import { socketEventInitializer } from "./core/index.js";

const PORT: number = parseInt(process.env.PORT!) || 300

const server = fastify();
boilatePlugins(server) // setting up the fastify plugin . . .

server.ready().then(() => {
  socketEventInitializer(server)
});

server.listen({ port: PORT,host:'0.0.0.0' });
declare module "fastify" {
    interface FastifyInstance {
      io: Server;
    }
  }