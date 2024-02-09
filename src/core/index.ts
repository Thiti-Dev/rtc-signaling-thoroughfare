import { FastifyInstance } from "fastify";
import { MAXIMUM_CAPACITY_IN_EACH_ROOM } from "../constants/config.js";
import { SignalingPayload } from "../shared/types.js";
// In-memory database to temporarily store the information
const users:Record<string,string[]> = {};
const socketToRoom:Record<string,string> = {};
const socketToIam:Record<string,string> = {};
// --------------------------------------------------------
export function socketEventInitializer(server: FastifyInstance){
    server.io.on("connection", (socket) => {
        const { iam } = socket.handshake.query;
        if(!iam){
            // If iam not provided
            // later on will make some custom logic to check whether it really came from the origin that is whitelisted, not via illegal-intervention
            socket.disconnect(true)
            return console.log(`Connection rejected -> ${socket.id}: Required parameter is missing.`);
        }
        console.info("Socket connected! : " +  socket.id + " with identity -> " + iam)
            // On room joining request
            socket.on("join room", (roomID:string) => {
              if (users[roomID]) {
                  // if room exists
                  const length = users[roomID].length;
                  if (length === MAXIMUM_CAPACITY_IN_EACH_ROOM) {
                      socket.emit("room full"); // send individual request implying that the room is currently full
                      return;
                  }
                  users[roomID].push(socket.id);
              } else {
                  // if room hasn't yet instanciated
                  users[roomID] = [socket.id];
              }
              socketToRoom[socket.id] = roomID;
              socketToIam[socket.id] = iam as string
              const usersInThisRoom = users[roomID].filter((id:string) => id !== socket.id);
              socket.emit("all users", usersInThisRoom); // inform this newly connected socket of existing users in this room
            });
    
            // Sending signal request
            socket.on("sending signal", (payload:SignalingPayload) => {
                server.io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID, callerIAM:  socketToIam[payload.callerID]});
            });
    
            // Returning signal request
            socket.on("returning signal", (payload:SignalingPayload) => {
                server.io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id, callerIAM:  socketToIam[socket.id] });
            });
    
            // On disconnect hook
            socket.on('disconnect', () => {
                const roomID = socketToRoom[socket.id];
                let room = users[roomID];
                if (room) {
                    server.io.emit("disconnect notify", socket.id) // global emit, as we also check on the client side before trying to dismount the audio element, If the virtual-space has more population using in the future consider iterating in each {{users}} in certain room and individually fires event to those inclusive people
                    room = room.filter((id:string) => id !== socket.id);
                    users[roomID] = room;
                }
          });
      });
}