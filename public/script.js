joystick = document.getElementById("joystick");
const socket = io();
let x;
let y;
let lastTouchTime = 0;  
let throttleDelay = 100;
let multitouch = 0

setPosition(window.innerWidth/2-joystick.offsetWidth/2,window.innerHeight/2-joystick.offsetHeight/2)


// Call the function to position the button at (200px, 300px)
document.addEventListener("dblclick", function(event) {event.preventDefault(); }, { passive: false });

function setPosition(x,y) {
    joystick.style.left = `${x}px`;   // Set the horizontal position (in pixels)
    joystick.style.top = `${y}px`;
}

document.addEventListener("touchstart", function(event) {
    multitouch += 1
    event.preventDefault();  // Prevent default action (e.g., scrolling)
    tempx = event.touches[0].pageX;
    tempy = event.touches[0].pageY;
    if (multitouch == 1){
        moveJoystick(tempx,tempy);
        touchInterval = setInterval(function() {
        if (event.touches.length > 0) {
            moveJoystick(x,y);
            emitDirection(x, y)
        }
        }, throttleDelay);
    }
}, { passive: false });



document.addEventListener("touchmove", function(event) {
    event.preventDefault();  // Prevent default action (e.g., scrolling)
    x = event.touches[0].pageX;  // Use the current touch position, updated in each interval
    y = event.touches[0].pageY;  // Use the current touch position, updated in each interval
    moveJoystick(x, y);
}, { passive: false });


document.addEventListener("touchend", function(event) {
    multitouch -= 1
    if (multitouch == 0){
            clearInterval(touchInterval);  // Stop the interval checking
        console.log('Touch ended');
        setPosition(window.innerWidth/2-joystick.offsetWidth/2,window.innerHeight/2-joystick.offsetHeight/2);
    }
}, { passive: false });

function moveJoystick(fingerX, fingerY) {
    let centerX = window.innerWidth/2;
    let centerY = window.innerHeight/2;

    const moveDistance = 100

    let dist = Math.sqrt((fingerX-centerX)*(fingerX-centerX) + (fingerY-centerY)*(fingerY-centerY))
    if (dist > moveDistance) {
        xdir = (fingerX - centerX)/dist;
        ydir = (fingerY - centerY)/dist;
    } else {
        xdir = (fingerX - centerX) / moveDistance
        ydir = (fingerY - centerY) / moveDistance
    }

    x = centerX + moveDistance * xdir
    y = centerY + moveDistance * ydir
    
    joystick.style.left = `${x-joystick.offsetWidth/2}px`;
    joystick.style.top = `${y-joystick.offsetHeight/2}px`; 
}

function emitDirection(fingerX, fingerY) {
    let centerX = window.innerWidth/2;
    let centerY = window.innerHeight/2;

    const moveDistance = 100

    let dist = Math.sqrt((fingerX-centerX)*(fingerX-centerX) + (fingerY-centerY)*(fingerY-centerY))
    if (dist > moveDistance) {
        xdir = (fingerX - centerX)/dist;
        ydir = (fingerY - centerY)/dist;
    } else {
        xdir = (fingerX - centerX) / moveDistance
        ydir = (fingerY - centerY) / moveDistance
    }

    socket.emit("moveAvatar", {xdir,ydir});
}
