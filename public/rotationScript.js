const socket = io();
let throttleDelay = 100;

// Call the function to position the button at (200px, 300px)
document.addEventListener("dblclick", function(event) {event.preventDefault(); }, { passive: false });
document.addEventListener("contextmenu", function(event) {event.preventDefault();});


let buttons = [["buttonup","forward"],["buttondown","backward"],["buttonright","clockwise"],["buttonleft","counterclockwise"]]
for (let i=0; i<buttons.length; i++) {
    document.getElementById(buttons[i][0]).addEventListener("touchstart", function(event) {
        touchInterval = setInterval(function() {
            if (event.touches.length > 0) {
                emitDirection(buttons[i][1])
            }
        }, throttleDelay);
    }, { passive: false });


    document.getElementById(buttons[i][0]).addEventListener("touchend", function(event) {
        clearInterval(touchInterval);  // Stop the interval checking
    }, { passive: false });

}


function emitDirection(direction) {
    socket.emit("moveRotation", {direction});
}
