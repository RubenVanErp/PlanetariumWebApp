const socket = io();
let throttleDelay = 33;
let rocketPosition;
screenCenter = {x: 0, y: 0}
let speed = 0;
const maxSpeed = 6;
const speedStep = maxSpeed / 12
const rotationSpeed = maxSpeed / 50;
let slowdownInterval;

let rocketColor = {r:120 + Math.floor(Math.random() * 120), g:120 + Math.floor(Math.random() * 120), b:120 + Math.floor(Math.random() * 120)}
let miniRocket = document.createElement("div");
miniRocket.id = "miniRocket"
minimap.appendChild(miniRocket);
miniRocket.innerHTML = getRocketSVG(miniRocket, rocketColor.r,rocketColor.g,rocketColor.b)
miniRocket.style.setProperty('--visibility', "hidden")
miniRocket.style.transform = "rotate(" + String(45) + "deg)";



function moveAvatar(avatar, direction, speed){
  let centerX = screenCenter.x; 
  let centerY = screenCenter.y;

  let centerXDir = centerX - avatar.x;
  let centerYDir = centerY - avatar.y;

  let CenterVectorLength = Math.sqrt(centerXDir**2 + centerYDir**2)

  if (CenterVectorLength == 0){ CenterVectorLength = 0.0001}
  centerXDir = centerXDir/CenterVectorLength
  centerYDir = centerYDir/CenterVectorLength
  
  let rocketXDir = Math.cos(avatar.rotation)
  let rocketYDir = Math.sin(avatar.rotation)

  
  let innerProduct = centerXDir*rocketXDir+centerYDir*rocketYDir
  if (Math.abs(innerProduct)>1) {innerProduct = innerProduct/Math.abs(innerProduct)}
  let angleBetweenCenterAndRocketBeforeMove = Math.acos(innerProduct)

  if (direction == "backward"){
    directionFactor = 1
  } else if (direction == "forward"){
    directionFactor = -1
  }

  avatar.x -= directionFactor * speed * Math.cos(avatar.rotation);
  avatar.y -= directionFactor * speed * Math.sin(avatar.rotation);
  
  centerXDir = centerX - avatar.x;
  centerYDir = centerY - avatar.y;

  CenterVectorLength = Math.sqrt(centerXDir**2 + centerYDir**2)

  if (CenterVectorLength == 0){ CenterVectorLength = 0.0001}
  centerXDir = centerXDir/CenterVectorLength
  centerYDir = centerYDir/CenterVectorLength

  innerProduct = centerXDir*rocketXDir+centerYDir*rocketYDir
  if (Math.abs(innerProduct)>1) {innerProduct = innerProduct/Math.abs(innerProduct)}
  let angleBetweenCenterAndRocketAfterMove = Math.acos(innerProduct)

  if (CenterVectorLength > speed * 3){
     avatar.rotation -=  Math.sign(crossProduct({x:centerXDir, y:centerYDir, z:0},   {x:rocketXDir, y:rocketYDir, z:0}).z) * (angleBetweenCenterAndRocketAfterMove - angleBetweenCenterAndRocketBeforeMove)
  }

  boundaryDistance = screenCenter.height/2 - 30
  if ( CenterVectorLength > boundaryDistance){
    avatar.x = centerX + boundaryDistance * (avatar.x - centerX)/CenterVectorLength
    avatar.y = centerY + boundaryDistance * (avatar.y - centerY)/CenterVectorLength
  }


}
function crossProduct(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
  
}
function updateMiniMap(rocketPosition){
  let minimap = document.getElementById("minimap")
  let miniRocket = document.getElementById("miniRocket")

  let relativePosition = {x: rocketPosition.x - screenCenter.x, y: rocketPosition.y - screenCenter.y }
  let normalizedPosition = {x: relativePosition.x / (screenCenter.height), y: relativePosition.y / (screenCenter.height)}

  minimapCenter = {x: minimap.offsetWidth/2, y: minimap.offsetHeight/2}
  minimapDiameter = minimap.offsetWidth

  miniY = normalizedPosition.y * minimapDiameter + minimapCenter.y - miniRocket.offsetHeight/2;
  miniX = normalizedPosition.x * minimapDiameter + minimapCenter.x - miniRocket.offsetWidth/2;

  miniRocket.style.setProperty('--visibility', "visible")
  miniRocket.style.transform = `
  translate3d(${miniX}px, ${miniY}px, 0) 
  rotate(${45 + rocketPosition.rotation / Math.PI * 180}deg)
`;
  miniRocket.style.transform = "transition: left 0.1s linear, top 0.1s linear, transform 0.1s linear;"
  
}
function getRocketSVG(minirocket, red,green,blue){ 
  return rocketSVG = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="' + String(minirocket.offsetWidth) + '" height="' + String(minirocket.offsetHeight) + '" viewBox="0 0 256 256" xml:space="preserve"><g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)"><path d="M 89.983 5.63 c -0.006 -0.267 -0.016 -0.534 -0.026 -0.802 c -0.011 -0.299 -0.02 -0.597 -0.036 -0.897 c -0.031 -0.602 -0.07 -1.207 -0.121 -1.814 c -0.081 -0.973 -0.854 -1.745 -1.827 -1.827 c -0.607 -0.051 -1.21 -0.089 -1.811 -0.121 c -0.305 -0.016 -0.607 -0.025 -0.909 -0.036 c -0.262 -0.009 -0.525 -0.02 -0.786 -0.025 c -0.437 -0.01 -0.871 -0.013 -1.304 -0.013 c -0.072 0 -0.145 0 -0.217 0.001 c -8.628 0.042 -16.548 2.16 -24.544 6.526 C 58.261 6.7 58.12 6.773 57.979 6.85 c -0.05 0.028 -0.099 0.052 -0.149 0.08 c -0.011 0.006 -0.02 0.016 -0.031 0.022 c -6.556 3.654 -13.101 8.811 -19.875 15.585 c -0.77 0.77 -1.523 1.55 -2.268 2.334 l -13.164 1.001 c -0.385 0.029 -0.753 0.169 -1.06 0.402 L 0.785 41.987 c -0.657 0.5 -0.94 1.352 -0.711 2.145 c 0.228 0.793 0.92 1.364 1.742 1.439 l 19.373 1.749 l 6.134 6.134 c -2.174 0.497 -4.389 1.715 -6.286 3.611 c -1.136 1.137 -2.048 2.411 -2.716 3.803 c -0.873 1.849 -2.79 6.61 -4.82 11.651 l -0.991 2.459 c -0.3 0.744 -0.127 1.595 0.441 2.162 c 0.382 0.383 0.894 0.586 1.415 0.586 c 0.251 0 0.505 -0.048 0.748 -0.146 l 2.547 -1.027 c 5 -2.014 9.723 -3.917 11.576 -4.79 c 1.38 -0.664 2.655 -1.576 3.79 -2.711 c 1.896 -1.896 3.113 -4.111 3.61 -6.285 l 5.952 5.952 l 1.749 19.372 c 0.074 0.822 0.646 1.514 1.439 1.742 c 0.183 0.053 0.369 0.078 0.553 0.078 c 0.614 0 1.207 -0.283 1.592 -0.789 l 15.711 -20.646 c 0.233 -0.307 0.373 -0.675 0.402 -1.06 l 0.971 -12.775 c 0.857 -0.811 1.706 -1.635 2.547 -2.475 c 6.779 -6.779 11.939 -13.327 15.594 -19.887 c 0.004 -0.007 0.01 -0.013 0.014 -0.02 c 0.018 -0.032 0.033 -0.063 0.051 -0.095 c 0.167 -0.301 0.326 -0.602 0.486 -0.904 c 4.207 -7.847 6.251 -15.635 6.295 -24.099 c 0.001 -0.083 0.001 -0.165 0.001 -0.248 C 89.996 6.488 89.993 6.06 89.983 5.63 z M 64.413 37.493 c -1.577 1.577 -3.675 2.447 -5.907 2.447 c -2.231 0 -4.329 -0.869 -5.907 -2.447 c -3.257 -3.258 -3.257 -8.557 0 -11.815 v 0 c 3.259 -3.257 8.559 -3.255 11.814 0 c 1.578 1.577 2.448 3.675 2.448 5.907 S 65.992 35.915 64.413 37.493 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb('+ String(red) +',' + String(green) + ',' + String(blue) + '); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round"/></g></svg>'
}

// Prevent default gestures
document.addEventListener("dblclick", e => e.preventDefault(), { passive: false });
document.addEventListener("contextmenu", e => e.preventDefault());

const buttons = [
  ["buttonup", "forward"],
  ["buttondown", "backward"],
  ["buttonright", "clockwise"],
  ["buttonleft", "counterclockwise"]
];

let touchIntervals = {};
let toggleStates = { forward: false, backward: false };

for (let [buttonId, direction] of buttons) {
  const button = document.getElementById(buttonId);

  if (direction === "forward" || direction === "backward") {
    // Toggle logic for forward/backward
    button.addEventListener("touchstart", (event) => {
      event.preventDefault();
      if (!rocketPosition) {
        rocketPosition = { x: screenCenter.x, y: screenCenter.y, rotation: Math.random() * 2 * Math.PI , rocketColor, thrustOn: false };
      }

      if (toggleStates[direction]) {
        // Stop movement

        rocketPosition.thrustOn = false
        clearInterval(touchIntervals[buttonId]);
        startSlowdown(rocketPosition, direction)
        delete touchIntervals[buttonId];
        toggleStates[direction] = false;
        button.style.backgroundColor = "#002b38";
        button.textContent = "GO"
        button.style.transform = `scale(1)`;
      } else {
        rocketPosition.thrustOn = true
        // Start movement
        killSlowdown()
        if (speed < maxSpeed){
          speed += speedStep
        }
        toggleStates[direction] = true;
        button.style.transform = `scale(0.9)`;
        button.textContent = "STOP"
        touchIntervals[buttonId] = setInterval(() => {
          if (speed < maxSpeed){
            speed += speedStep
          }
          moveAvatar(rocketPosition, direction, speed);
          emitLocation(rocketPosition);
          updateMiniMap(rocketPosition);
        }, throttleDelay);
      }
    }, { passive: false });

  } else {
    // Hold-based logic for left/right (rotation)
    button.addEventListener("touchstart", (event) => {
      event.preventDefault();
      if (touchIntervals[buttonId]) return;
      if (!rocketPosition) {
        rocketPosition = { x: screenCenter.x, y: screenCenter.y, rotation: 0, rocketColor, thrustOn: false };
      }

      touchIntervals[buttonId] = setInterval(() => {
        if (direction === "clockwise") {
          rocketPosition.rotation += rotationSpeed;
        } else if (direction === "counterclockwise") {
          rocketPosition.rotation -= rotationSpeed;
        }


        emitLocation(rocketPosition);
        updateMiniMap(rocketPosition);
        button.style.transform = `scale(0.9)`;
      }, throttleDelay);
    }, { passive: false });

    const stopTouch = () => {
      clearInterval(touchIntervals[buttonId]);
      delete touchIntervals[buttonId];
      button.style.backgroundColor = "#002b38";
      button.style.transform = `scale(1)`;
    };
    button.addEventListener("touchend", stopTouch, { passive: false });
    button.addEventListener("touchcancel", stopTouch, { passive: false });
  }
}

function emitLocation(rocketPosition){
  socket.volatile.emit("reportRocketPosition", {rocketPosition})
}

socket.on("updatedSceenCenter", (data) => {
  screenCenter = {x: data.screenCenter.x, y: data.screenCenter.y, height: data.screenHeight, width: data.screenWidth}
});

document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
  });
  document.addEventListener('gesturechange', function (e) {
    e.preventDefault();
  });
  document.addEventListener('gestureend', function (e) {
    e.preventDefault();
  });

  function killSlowdown(){
    if (slowdownInterval){clearInterval(slowdownInterval)}
  }
function startSlowdown(rocketPosition, direction) {
  slowdownInterval = setInterval(() => {
    moveAvatar(rocketPosition, direction, speed);
    emitLocation(rocketPosition);
    updateMiniMap(rocketPosition);
    speed -= speedStep
    if (speed <=0)(
      killSlowdown()
    )
  }, throttleDelay);
}