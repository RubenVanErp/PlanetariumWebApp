const socket = io();
const scenes = [
    { name: "default", path: "assets/starfield.jpg" },
    { name: "second", path: "assets/second.jpg" }
  ];
  socket.emit("registerSceneScreen", {})

  document.addEventListener("DOMContentLoaded", function () {
    const background = document.createElement("div");
    background.id = "statsBackground";
    background.classList.add("background");
    background.style.setProperty("top", 10 , "px");
    background.style.setProperty("left", "5vw");
    background.style.setProperty("width", "90vw");
    background.style.setProperty("height", "180px");
    background.style.setProperty("position", "absolute");

    const playerCountText = document.createElement("div");
    playerCountText.id = "playerCountText";
    playerCountText.classList = "text"
    playerCountText.textContent = "Player Count: "
    playerCountText.style.setProperty("position", "absolute");
    playerCountText.style.setProperty("top", 20 + "px");
    playerCountText.style.setProperty("left", "1vw");
    playerCountText.style.setProperty("position", "absolute");

    const playerCountNumber = document.createElement("div");
    playerCountNumber.id = "playerCountNumber";
    playerCountNumber.classList = "text"
    playerCountNumber.textContent = "0"
    playerCountNumber.style.setProperty("position", "absolute");
    playerCountNumber.style.setProperty("top", 20 + "px");
    playerCountNumber.style.setProperty("left", 110 + "px");
    playerCountNumber.style.setProperty("position", "absolute");

    const frameRateText = document.createElement("div");
    frameRateText.id = "frameRateText";
    frameRateText.classList = "text"
    frameRateText.textContent = "Current framerate: "
    frameRateText.style.setProperty("position", "absolute");
    frameRateText.style.setProperty("top", 40 + "px");
    frameRateText.style.setProperty("left", "1vw");
    frameRateText.style.setProperty("position", "absolute");

    const frameRateNumber = document.createElement("div");
    frameRateNumber.id = "frameRateNumber";
    frameRateNumber.classList = "text"
    frameRateNumber.textContent = "0"
    frameRateNumber.style.setProperty("position", "absolute");
    frameRateNumber.style.setProperty("top", 40 + "px");
    frameRateNumber.style.setProperty("left", 140 + "px");
    frameRateNumber.style.setProperty("position", "absolute");

    const aimedFrameRateText = document.createElement("div");
    aimedFrameRateText.id = "aimedFrameRateText";
    aimedFrameRateText.classList = "text"
    aimedFrameRateText.textContent = "Aimed framerate: "
    aimedFrameRateText.style.setProperty("position", "absolute");
    aimedFrameRateText.style.setProperty("top", 60 + "px");
    aimedFrameRateText.style.setProperty("left", "1vw");
    aimedFrameRateText.style.setProperty("position", "absolute");

    const aimedFrameRateNumber = document.createElement("div");
    aimedFrameRateNumber.id = "aimedFrameRateNumber";
    aimedFrameRateNumber.classList = "text"
    aimedFrameRateNumber.textContent = "0"
    aimedFrameRateNumber.style.setProperty("position", "absolute");
    aimedFrameRateNumber.style.setProperty("top", 60 + "px");
    aimedFrameRateNumber.style.setProperty("left", 140 + "px");
    aimedFrameRateNumber.style.setProperty("position", "absolute");

    const desiredFrameRateTextArea = document.createElement("textarea");
    desiredFrameRateTextArea.id = "desiredFrameRateTextArea";
    desiredFrameRateTextArea.classList = "textarea"
    desiredFrameRateTextArea.textContent = "10"
    desiredFrameRateTextArea.style.setProperty("position", "absolute");
    desiredFrameRateTextArea.style.setProperty("top", 60 + "px");
    desiredFrameRateTextArea.style.setProperty("left", 340 + "px");
    desiredFrameRateTextArea.style.setProperty("position", "absolute");

    const desiredFrameRateTextButton = document.createElement("button");
    desiredFrameRateTextButton.innerText = "send new framerate";
    desiredFrameRateTextButton.style.setProperty("position", "absolute");
    desiredFrameRateTextButton.style.setProperty("top", "30px");
    desiredFrameRateTextButton.style.setProperty("left", "320px");
    desiredFrameRateTextButton.onclick = function () {
      setFrameRate(desiredFrameRateTextArea.value);
    };

    document.body.appendChild(background)
    background.appendChild(playerCountText)
    background.appendChild(playerCountNumber)
    background.appendChild(frameRateText)
    background.appendChild(frameRateNumber)
    background.appendChild(aimedFrameRateText)
    background.appendChild(aimedFrameRateNumber)
    background.appendChild(desiredFrameRateTextArea)
    background.appendChild(desiredFrameRateTextButton)

    for (let i = 0; i < scenes.length; i++) {
      const background = document.createElement("div");
      background.id = scenes[i].name + "Background";
      background.classList.add("background");
      background.style.setProperty("top", 200 + i * 110 + "px");
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

  function setFrameRate(frameRate) {
    socket.emit("setFrameRate", {frameRate:frameRate})
    console.log(frameRate);
  }
  

  socket.on("updateData", (data) =>{
    playerCountNumber = document.getElementById("playerCountNumber")
    playerCountNumber.textContent = data.number - 2
    frameRateNumber = document.getElementById("frameRateNumber")
    frameRateNumber.textContent = 1000/data.actualFrameRate
    aimedFrameRateNumber = document.getElementById("aimedFrameRateNumber")
    aimedFrameRateNumber.textContent = 1000/data.aimedFrameRate

  });