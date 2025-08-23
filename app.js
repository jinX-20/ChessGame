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

  socket.on("churan", () => {
    console.log("Churan received from client");
  })

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});