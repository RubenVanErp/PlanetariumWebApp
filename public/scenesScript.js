const socket = io();
const scenes = [
    { name: "default", path: "assets/starfield.jpg" },
    { name: "second", path: "assets/second.jpg" }
  ];
  
  document.addEventListener("DOMContentLoaded", function () {
    for (let i = 0; i < scenes.length; i++) {
      const background = document.createElement("div");
      background.id = scenes[i].name + "Background";
      background.classList.add("background");
      background.style.setProperty("top", 10 + i * 110 + "px");
      background.style.setProperty("left", "5vw");
      background.style.setProperty("width", "90vw");
      background.style.setProperty("height", "100px");
      background.style.setProperty("position", "absolute");
  
      const img = document.createElement("img");
      img.src = scenes[i].path;
      img.style.setProperty("position", "absolute");
      img.style.setProperty("top", "5px");
      img.style.setProperty("left", "calc(90vw - 95px)");
      img.style.setProperty("width", "90px");
      img.style.setProperty("height", "90px");

      const button = document.createElement("button");
      button.innerText = "Switch scene to " + scenes[i].name;
      button.style.setProperty("position", "absolute");
      button.style.setProperty("top", "30px");
      button.style.setProperty("left", "20px");
      button.onclick = function () {
        switchScenes(scenes[i].path);
      };
  
      background.appendChild(img);
      background.appendChild(button);
      document.body.appendChild(background);
    }
  });
  
  // Example switchScenes function (you'll want to customize this)
  function switchScenes(path) {
    console.log("Switching scene to:", path);
    socket.emit("switchScene", {path})
  }