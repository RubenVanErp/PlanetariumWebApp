const socket = io();
let throttleDelay = 100;

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

for (let [buttonId, direction] of buttons) {
  const button = document.getElementById(buttonId);

  button.addEventListener("touchstart", (event) => {
    event.preventDefault();

    // Avoid stacking intervals
    if (touchIntervals[buttonId]) return;

    touchIntervals[buttonId] = setInterval(() => {
      emitDirection(direction);
    }, throttleDelay);
  }, { passive: false });

  const stopTouch = () => {
    clearInterval(touchIntervals[buttonId]);
    delete touchIntervals[buttonId];
  };

  button.addEventListener("touchend", stopTouch, { passive: false });
  button.addEventListener("touchcancel", stopTouch, { passive: false });
}

function emitDirection(direction) {
  socket.emit("moveRotation", { direction });
}