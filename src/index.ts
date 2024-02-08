import fastify from "fastify";
import { Server } from "socket.io";
import { boilatePlugins } from "./plugins/boilate.js";
import { socketEventInitializer } from "./core/index.js";
const server = fastify();
boilatePlugins(server) // setting up the fastify plugin . . .

server.ready().then(() => {
  socketEventInitializer(server)
});

server.listen({ port: 3000 });
declare module "fastify" {
    interface FastifyInstance {
      io: Server;
    }
  }