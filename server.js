const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require('path');

/*---------------------------

TODO:
check why using mobile its jittery
Fix multitouch
Server side throtteling and batching
Cloud hosting
Fix the scaling, not linear in distance, but some other relation of circle circumference vs sphere slice circumferance

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

// Serve de HTML-pagina voor spelers
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/user.html");
});

// Serve de joystick HTML-pagina voor spelers
app.get("/joystick", (req, res) => {
  res.sendFile(__dirname + "/public/joystick.html");
});

app.get("/rotation", (req, res) => {
  res.sendFile(__dirname + "/public/rotationControl.html");
});

// Serve de centrale pagina (voor het centrale scherm)
app.get("/central", (req, res) => {
  res.sendFile(__dirname + "/public/central.html");
});

// WebSocket logica
io.on("connection", (socket) => {
  console.log(`Nieuwe verbinding: ${socket.id}`);

  socket.on("registerCentralScreen", () => {
    centralScreenSocket.push(socket.id);
    console.log(`Central screen registered: ${socket.id}`);
  });

  // Bij de eerste verbinding krijgt elke client de initiële avatarposities
  socket.emit("allAvatars", avatars);

  // Ontvang input van de client (bewegingen)
  socket.on("move", (data) => {
    // Bewaar de nieuwe positie van de avatar
    if (!avatars[socket.id]) {
      avatars[socket.id] = { x: 100, y: 100 };  // Startpositie
    }

    if (data.direction === "left") {
      avatars[socket.id].x -= 50;
    } else if (data.direction === "right") {
      avatars[socket.id].x += 50;
    } else if (data.direction === "up") {
      avatars[socket.id].y -= 50;
    } else if (data.direction === "down") {
      avatars[socket.id].y += 50;
    }

    // Stuur de nieuwe posities van alle avatars naar alle clients
    io.emit("updateAvatars", avatars);
  });

  socket.on("moveAvatar", (data) => {
    // Bewaar de nieuwe positie van de avatar
    if (!avatars[socket.id]) {
      avatars[socket.id] = { x: 100, y: 100 };  // Startpositie
    }
    const speed = 10;
    
    avatars[socket.id].x += speed * data.xdir
    avatars[socket.id].y += speed * data.ydir

    // Stuur de nieuwe posities van alle avatars naar alle clients
    updateAvatars()
  });

  socket.on("moveRotation", (data) => {
    // Bewaar de nieuwe positie van de avatar
    if (!avatars[socket.id]) {
      avatars[socket.id] = { x: 301, y: 300, rotation:0 };  // Startpositie
    }
    const speed = 20;
    const rotationSpeed = speed/100;
    
    if (data.direction == "forward"){
      let centerX = 300; //FIX this, get actual center
      let centerY = 300;

      let centerXDir = centerX - avatars[socket.id].x;
      let centerYDir = centerY - avatars[socket.id].y;

      let CenterVectorLength = Math.sqrt(centerXDir**2 + centerYDir**2)

      centerXDir = centerXDir/CenterVectorLength
      centerYDir = centerYDir/CenterVectorLength
      
      let rocketXDir = Math.cos(avatars[socket.id].rotation)
      let rocketYDir = Math.sin(avatars[socket.id].rotation)

      let angleBetweenCenterAndRocketBeforeMove = Math.acos(centerXDir*rocketXDir+centerYDir*rocketYDir)

      avatars[socket.id].x += speed * Math.cos(avatars[socket.id].rotation);
      avatars[socket.id].y += speed * Math.sin(avatars[socket.id].rotation);
      //avatars[socket.id].rotation compared to center, angle should be conserverd.
      //Calculate angle made by rocket and center, and this should stay the same through 
      //forward or backward motion.

      centerXDir = 300 - avatars[socket.id].x;
      centerYDir = 300 - avatars[socket.id].y;

      CenterVectorLength = Math.sqrt(centerXDir**2 + centerYDir**2)

      centerXDir = centerXDir/CenterVectorLength
      centerYDir = centerYDir/CenterVectorLength

      let angleBetweenCenterAndRocketAfterMove = Math.acos(centerXDir*rocketXDir+centerYDir*rocketYDir)
      if (CenterVectorLength > speed * 1){
        avatars[socket.id].rotation -= angleBetweenCenterAndRocketAfterMove - angleBetweenCenterAndRocketBeforeMove
      }
      console.log(angleBetweenCenterAndRocketAfterMove)
    }
    if (data.direction == "backward"){
      let centerX = 300; //FIX this, get actual center
      let centerY = 300;

      let centerXDir = centerX - avatars[socket.id].x;
      let centerYDir = centerY - avatars[socket.id].y;

      let CenterVectorLength = Math.sqrt(centerXDir**2 + centerYDir**2)

      centerXDir = centerXDir/CenterVectorLength
      centerYDir = centerYDir/CenterVectorLength
      
      let rocketXDir = Math.cos(avatars[socket.id].rotation)
      let rocketYDir = Math.sin(avatars[socket.id].rotation)

      let angleBetweenCenterAndRocketBeforeMove = Math.acos(centerXDir*rocketXDir+centerYDir*rocketYDir)

      avatars[socket.id].x -= speed * Math.cos(avatars[socket.id].rotation);
      avatars[socket.id].y -= speed * Math.sin(avatars[socket.id].rotation);

      centerXDir = 300 - avatars[socket.id].x;
      centerYDir = 300 - avatars[socket.id].y;

      CenterVectorLength = Math.sqrt(centerXDir**2 + centerYDir**2)

      centerXDir = centerXDir/CenterVectorLength
      centerYDir = centerYDir/CenterVectorLength

      let angleBetweenCenterAndRocketAfterMove = Math.acos(centerXDir*rocketXDir+centerYDir*rocketYDir)
      if (CenterVectorLength > speed * 1){
        avatars[socket.id].rotation -= angleBetweenCenterAndRocketAfterMove - angleBetweenCenterAndRocketBeforeMove
      }
      console.log(angleBetweenCenterAndRocketAfterMove)

    }
    if (data.direction == "clockwise"){
      avatars[socket.id].rotation = (avatars[socket.id].rotation + rotationSpeed) ;
    }
    if (data.direction == "counterclockwise"){
      avatars[socket.id].rotation = (avatars[socket.id].rotation - rotationSpeed) ;
    }
    if (avatars[socket.id].rotation>100*Math.PI){avatars[socket.id].rotation-=100*Math.PI}

    // Stuur de nieuwe posities van alle avatars naar alle clients
    updateAvatars()
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
    
    updateAvatars()  // Update de avatars voor alle clients
    }
  });
});

// Start de server
server.listen(port, () => {
  console.log(`Server draait op http://localhost:${port}`);
});

