const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require('path');
const { secureHeapUsed } = require("crypto");

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

function sphericalTo2d(P){
  // constants for your canvas
const cx = screenWidth  / 2;
const cy = screenHeight / 2;
const f  = screenWidth / Math.PI;   // equidistant 180°
  // P is {x,y,z} on unit sphere
  const theta = Math.acos(P.z);                // n = (0,0,1)
  const phi   = Math.atan2(P.y, P.x);
  const r = f * theta;
  return {
    u: cx + r * Math.cos(phi),
    v: cy + r * Math.sin(phi)
  };
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

  socket.on("moveRotation", (data) => {
    // Bewaar de nieuwe positie van de avatar
    if (!avatars[socket.id]) {
      //avatars[socket.id] = { P:{x: 0, y: 0, z:1}, rotation:0 };  // Startpositie spherical
      avatars[socket.id] = { x: 300, y: 300, rotation:0 }; // Startpositie Polar
    }

    const speed = 20;
    const rotationSpeed = speed/100;
    /*
    if (data.direction == "forward"){
      //spherical movement
      // fixed great‑circle axis (unit) and start point P0
      A = avatars[socket.id].P
      B = {x:0, y:0, z:0} //Some vector in the direction of 

      const k  = normalisedCross(A, B);
      const P0 = normalise(A);

      // advance parameter t by your speed (radians / frame)
      let t = 0;
      function step() {
        t += deltaT;
        const P = {
          x: Math.cos(t)*P0.x + Math.sin(t)*(k.y*P0.z - k.z*P0.y) + (1-Math.cos(t))*k.x*(k.x*P0.x+k.y*P0.y+k.z*P0.z),
          y: Math.cos(t)*P0.y + Math.sin(t)*(k.z*P0.x - k.x*P0.z) + (1-Math.cos(t))*k.y*(k.x*P0.x+k.y*P0.y+k.z*P0.z),
          z: Math.cos(t)*P0.z + Math.sin(t)*(k.x*P0.y - k.y*P0.x) + (1-Math.cos(t))*k.z*(k.x*P0.x+k.y*P0.y+k.z*P0.z)
        };
        const {u,v} = projectToScreen(P);
        avatarDiv.style.transform = `translate(${u}px,${v}px)`;
        requestAnimationFrame(step);////
      }
      requestAnimationFrame(step);////

    }
      */
    

    if (data.direction == "forward"){
    //polar movement
      let centerX = screenCenter.x; 
      let centerY = screenCenter.y;

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

      centerXDir = centerX - avatars[socket.id].x;
      centerYDir = centerY - avatars[socket.id].y;

      CenterVectorLength = Math.sqrt(centerXDir**2 + centerYDir**2)

      centerXDir = centerXDir/CenterVectorLength
      centerYDir = centerYDir/CenterVectorLength

      let angleBetweenCenterAndRocketAfterMove = Math.acos(centerXDir*rocketXDir+centerYDir*rocketYDir)
      if (CenterVectorLength > speed * 1){
        avatars[socket.id].rotation -= angleBetweenCenterAndRocketAfterMove - angleBetweenCenterAndRocketBeforeMove
      }
    }
    if (data.direction == "backward"){
      let centerX = screenCenter.x; 
      let centerY = screenCenter.y;

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

      centerXDir = centerX - avatars[socket.id].x;
      centerYDir = centerY - avatars[socket.id].y;
      
      CenterVectorLength = Math.sqrt(centerXDir**2 + centerYDir**2)

      centerXDir = centerXDir/CenterVectorLength
      centerYDir = centerYDir/CenterVectorLength

      let angleBetweenCenterAndRocketAfterMove = Math.acos(centerXDir*rocketXDir+centerYDir*rocketYDir)
      if (CenterVectorLength > speed * 1){
        avatars[socket.id].rotation -= angleBetweenCenterAndRocketAfterMove - angleBetweenCenterAndRocketBeforeMove
      }
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

  socket.on("reportScreenSize", (data) => {
    if (data.x != screenCenter.x || data.y != screenCenter.y){
      screenWidth = data.width
      screenHeight = data.height
      screenCenter.x = data.x
      screenCenter.y = data.y
      console.log("Updated screen center to", data)
    }
  });
});

// Start de server
server.listen(port, () => {
  console.log(`Server draait op http://localhost:${port}`);
});

