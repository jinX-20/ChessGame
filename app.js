const express = require("express"); // Middle ware setup
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");
const { title } = require("process");

const app = express();

const server = http.createServer(app);
const io = socket(server);

const chessInstance = new Chess();
let players = {}
let currentPlayer = 'W'; // The first player who connects will be playing as white

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", {title: "A Chess game"});
});

io.on("connection", (socket) => { // socket is the unique information about that user
  console.log("A user connected");

  if (!players.white){
    players.white = socket.id; // every socket has unique id
    socket.emit("playerRole", "w"); // first player that comes gets white
  } else if (!players.black) {
    players.black = socket.id;
    socket.emit("playerRole", "b");
  } else{
    socket.emit("spectatorRole");
  }

  socket.on("disconnect", () => {
    if (socket.id) {
      console.log("A user disconnected");
      if (players.white === socket.id) {
        delete players.white;
      } else if (players.black === socket.id) {
        delete players.black;
      }
    }
  });

  socket.on("move", (moveMade) => {
    try{
      if (chessInstance.turn() === 'w' && socket.id !== players.white) {
        return;
      }
      if (chessInstance.turn() === 'b' && socket.id !== players.black) {
        return;
      }
      const result = chessInstance.move(moveMade);
      if (result){
        currentPlayer = chessInstance.turn();
        io.emit("move", moveMade);
        io.emit("boardState", chessInstance.fen());
      } else {
        console.log("Invalid move : ", moveMade);
        socket.emit("invalidMove", moveMade);
      }
    } catch(err){
      console.log(err);
      socket.emit("Invalid move : ", moveMade);
    }
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});