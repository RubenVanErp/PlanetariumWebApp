const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require('path');

/*---------------------------

TODO:
check why using mobile its jittery
Server side throtteling and batching
Cloud hosting launch
make pretty
add N E S W directions on dome and minimap
Add scene switching

notes:
Fisheye equidistant dome projection

---------------------------*/

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 3000;

let centralScreenSocket = [];
function updateAvatars() {
  if (centralScreenSocket) {
      io.to(centralScreenSocket).emit("allAvatars", avatars);
  }
}





/* Loop to check how many updates per second
let updateCounter = 0;
UpdateInterval = setInterval(function() {
  updateCounter +=1
}, 0);
UpdateLogInterval = setInterval(function() {
  console.log(updateCounter);
  updateCounter = 0;
}, 1000);
*/

app.use(express.static(path.join(__dirname, 'public')));

// Bijhouden van posities voor avatars
let avatars = {};
let screenCenter = {x:0, y:0}
let screenWidth = 0
let screenHeight = 0
let rocketColor = {r:0, g:255, b:0}

// Serve de HTML-pagina voor spelers
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/rotationControl.html");
});

app.get("/rotation", (req, res) => {
  res.sendFile(__dirname + "/public/rotationControl.html");
});

// Serve de centrale pagina (voor het centrale scherm)
app.get("/central", (req, res) => {
  res.sendFile(__dirname + "/public/central.html");
});

// Serve de centrale pagina (voor het centrale scherm)
app.get("/scenes", (req, res) => {
  res.sendFile(__dirname + "/public/scenes.html");
});

// WebSocket logica
io.on("connection", (socket) => {
  console.log(`Nieuwe verbinding: ${socket.id}`);

  socket.emit("updatedSceenCenter", {screenCenter, screenHeight, screenWidth})

  socket.on("registerCentralScreen", () => {
    centralScreenSocket.push(socket.id);
    console.log(`Central screen registered: ${socket.id}`);
  });

  socket.on("reportRocketPosition", (data) => {
    // Bewaar de nieuwe positie van de avatar
    if (!avatars[socket.id]) {
      avatars[socket.id] = { x: screenCenter.x+1, y: screenCenter.y, rotation:0 , rocketColor};  // Startpositie
    }
    avatars[socket.id] = data.rocketPosition  
  });

  socket.on("switchScene", (data) =>{
    if (centralScreenSocket) {
      io.to(centralScreenSocket).emit("switchSceneCentral", data);
  }
  });

  // Als iemand de verbinding verbreekt, verwijder de avatar
  socket.on("disconnect", () => {
    if (centralScreenSocket.includes(socket.id)) {
      index = centralScreenSocket.indexOf(socket.id);
      centralScreenSocket.splice(index, 1);
      console.log(`Central screen ${socket.id} disconnected`);
      
    } else {
      if (avatars[socket.id]){io.to(centralScreenSocket).emit("killDiv", socket.id);}
    console.log(`Gebruiker ${socket.id} is disconnected`);
    delete avatars[socket.id];  // Verwijder de avatar van de client
    }
  });

  socket.on("reportScreenCenter", (data) => {
    if (data.x != screenCenter.x || data.y != screenCenter.y){
      screenWidth = data.width
      screenHeight = data.height
      screenCenter.x = data.x
      screenCenter.y = data.y
      console.log("Updated screen center to", data)
      io.emit("updatedSceenCenter", {screenCenter, screenHeight, screenWidth})
    }
  });
});

// Start de server
server.listen(port, () => {
  console.log(`Server draait op http://localhost:${port}`);
});



const mainLoop = setInterval(function() {
  updateAvatars()
}, 100);