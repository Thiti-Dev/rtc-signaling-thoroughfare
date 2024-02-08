import { FastifyInstance } from "fastify";
import fastifyIO from "fastify-socket.io";
import cors from '@fastify/cors'

export async function boilatePlugins(server: FastifyInstance){
    await server.register(fastifyIO as any, {
        cors: {
          origin: "*", // REMINDER, don't forget to change to certain origin that we allow establishing in
          methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        },
      });
    await server.register(cors, {
        origin: "*", // REMINDER, don't forget to change to certain origin that we allow establishing in
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    })
}