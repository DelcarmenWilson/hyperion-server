import { Server as HttpServer } from "http";
import { Socket, Server } from "socket.io";

type User = {
  id: string;
  sid: string;
  role: string;
};

export class ServerSocket {
  public static instance: ServerSocket;
  public io: Server;

  /** Master list of all connected users */
  public users: User[];

  constructor(server: HttpServer) {
    ServerSocket.instance = this;
    this.users = [];
    this.io = new Server(server, {
      serveClient: false,
      pingInterval: 10000,
      pingTimeout: 5000,
      cookie: false,
      cors: {
        origin: "*",
      },
    });

    this.io.on("connect", this.StartListeners);
  }

  StartListeners = (socket: Socket) => {
    console.info("Message received from " + socket.id);

    socket.on(
      "handshake",
      (userId, role, callback: (uid: string, users: User[]) => void) => {
        console.info("Handshake received from: " + socket.id, userId);

        const reconnected = this.users.find((e) => e.sid == socket.id);

        if (reconnected) {
          console.info("This user has reconnected.");

          const uid = this.GetUidFromSocketId(socket.id);
          if (uid) {
            console.info("Sending callback for reconnect ...");
            callback(uid, this.users);
            return;
          }
        }
        this.users.push({ id: userId, sid: socket.id, role: role });

        console.info("Sending callback ...");
        callback(userId, this.users);

        this.SendMessage(
          "user_connected",
          this.users.filter((e) => e.sid !== socket.id),
          this.users
        );
      }
    );

    socket.on("disconnect", () => {
      console.info("Disconnect received from: " + socket.id);

      const uid = this.GetUidFromSocketId(socket.id);

      if (uid) {
        this.users = this.users.filter((e) => e.id != uid);
        this.SendMessage("user_disconnected", this.users, socket.id);
      }
    });
    //CONFERENCE
    socket.on("coach-request", (conference) => {
      const uid = this.GetUidFromSocketId(socket.id);
      const users = this.users.filter((e) => e.role == "admin" && e.id != uid);
      this.SendMessage("coach-request-received", users, { conference });
    });
    socket.on("coach-joined", (userId, conferenceId, coachId, coachName) => {
      const uid = this.GetSocketIdFromUid(userId);
      this.SendUserMessage("coach-joined-received", uid, {
        conferenceId,
        coachId,
        coachName,
      });
    });
    socket.on("coach-reject", (userId, coachName, reason) => {
      const uid = this.GetSocketIdFromUid(userId);
      this.SendUserMessage("coach-reject-received", uid, {
        coachName,
        reason,
      });
    });
    //CHAT MESSAGES
    socket.on("chat-message-sent", (userId, message) => {
      const uid = this.GetSocketIdFromUid(userId);
      this.SendUserMessage("chat-message-received", uid, {
        message,
      });
    });
    //LEAD SHARING
    socket.on("lead-shared", (userId, leadId, sharedUser) => {
      const uid = this.GetSocketIdFromUid(userId);
      this.SendUserMessage("lead-shared-received", uid, {
        leadId,
        sharedUser,
      });
      socket.emit("lead-shared-received", uid, {
        leadId,
        sharedUser,
      });
    });
    socket.on("lead-unshared", (userId, leadId) => {
      const uid = this.GetSocketIdFromUid(userId);
      this.SendUserMessage("lead-unshared-received", uid, {
        leadId,
      });
      socket.emit("lead-shared-received", uid, {
        leadId,
      });
    });
  };

  GetUidFromSocketId = (sid: string) => {
    return this.users.find((e) => e.sid == sid)?.id;
  };
  GetSocketIdFromUid = (id: string) => {
    return this.users.find((e) => e.id == id)?.sid;
  };

  SendMessage = (name: string, users: User[], payload?: Object) => {
    console.info("Emitting event: " + name + " to", users);
    users.forEach((user) =>
      payload
        ? this.io.to(user.sid).emit(name, payload)
        : this.io.to(user.sid).emit(name)
    );
  };
  SendUserMessage = (
    name: string,
    sid: string | undefined,
    payload?: Object
  ) => {
    if (!sid) return;
    console.info("Emitting event: " + name + " to", sid);

    payload ? this.io.to(sid).emit(name, payload) : this.io.to(sid).emit(name);
  };
}
