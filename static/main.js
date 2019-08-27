var bodyEle = document.body;
var locked = false;
var audio = new Audio("/static/ting.mp3");
var youCursor = document.getElementById("geed");
socket = io();
var globalcords = [0, 0];
var circleobj = document.querySelector(".circle");
var circlemode = false;
var circlemodex = 0;
var circlemodenon;
var angleofcursor;
var circlemodestart = 0;
var circlemodeborder = 0;
var treemode = false;
var treemodex = 0;
var circlecoords = [0, 0];
var circlemode;

console.log(users);
Object.entries(users).map(e => {
  if (e[0] == you) {
    globalcords[1] = e[1].x;
    globalcords[0] = e[1].y;
    return;
  }
  let newguy = document.createElement("img");
  newguy.id = e[0];
  newguy.src = "/static/mouse.png";
  newguy.width = 16;
  newguy.style.top = e[1].y;
  newguy.style.left = e[1].x;
  users[e[0]].obj = newguy;
  document.body.appendChild(newguy);
});

bodyEle.onclick = function(e) {
  bodyEle.requestPointerLock =
    bodyEle.requestPointerLock ||
    bodyEle.mozRequestPointerLock ||
    bodyEle.webkitRequestPointerLock;
  bodyEle.requestPointerLock();
  globalcords[1] = e.pageX;

  globalcords[0] = e.pageY;
};

document.addEventListener("pointerlockchange", changeCallback, false);

function changeCallback(e) {
  if (
    document.pointerLockElement === bodyEle ||
    document.mozPointerLockElement === bodyEle ||
    document.webkitPointerLockElement === bodyEle
  ) {
    document.addEventListener("mousemove", moveCallback, false);
    locked = true;
  } else {
    document.removeEventListener("mousemove", moveCallback, false);
    locked = false;
  }
}

var last2x = [0, 0];

var last2xav = 0;

var circley = circleobj.offsetTop + 75;
var circlex = circleobj.offsetLeft + 75;

function moveCallback(e) {
  var nextY = globalcords[0] + e.movementY;

  var nextX = globalcords[1] + e.movementX;

  let cordx = globalcords[1] + 11;
  let cordy = globalcords[0] + 18;

  if (parseInt(circleobj.style.width) > window.innerWidth) {
    if (!treemode) {
      treemode = true;

      console.log("GIS");

      document.querySelector(".cursorline").style.display = "block";
      document.querySelector(".movecircle").style.display = "block";

      circlecoords = [window.innerHeight / 2, window.innerWidth / 2];
    }

    if (treemodex >= 0) {
      treemodex -= e.movementX / 20;
    } else {
      treemodex = 0;
    }

    console.log(treemodex / 12);
    document.querySelector(
      ".movecircle"
    ).style.transform = `scale(${treemodex ** 0.8 / 400})`;

    circlecoords[1] = window.innerWidth / 2 + (treemodex < 0 ? 0 : treemodex);

    document.querySelector(".movecircle").style.left = circlecoords[1] - 70;

    return;
  }

  let circdistance =
    Math.abs(((nextY - circley) ** 2 + (nextX - circlex) ** 2) ** 0.5) / 3;

  circdistance =
    (circdistance < 0 ? 0 : circdistance) &&
    (circdistance > 256 ? 256 : circdistance);

  if (!circlemode)
    circleobj.style.background = `rgb(${[
      circdistance,
      256 - circdistance,
      0
    ].join(", ")})`;

  if (((cordy - circley) ** 2 + (cordx - circlex) ** 2) ** 0.5 < 75) {
    if (!circlemode) {
      circleobj.style.background = "black";
      circlemode = true;

      let circleslope = (cordy - circley) / (cordx - circlex);

      angleofcursor = Math.atan(circleslope);

      if (cordx < circlex) angleofcursor -= 3.15;

      globalcords[1] = 75 * Math.cos(angleofcursor) + circlex;
      globalcords[0] = 75 * Math.sin(angleofcursor) + circley;

      circlemodex = angleofcursor;
    }
  }

  if (circlemode) {
    circlemodex += e.movementX / 45;
    circlemodenon = circlemodex - angleofcursor;

    //(1 - Math.abs(circlemodex) * 0.0001)

    globalcords[1] =
      75 *
        (1 + Math.abs(circlemodenon) * 0.01) *
        Math.cos(circlemodex - circlemode * 0.1) +
      circlex -
      11;

    globalcords[0] =
      75 *
        (1 + Math.abs(circlemodenon) * 0.01) *
        Math.sin(circlemodex - circlemode * 0.1) +
      circley -
      18;

    circleobj.style.width =
      2 * ((cordx - circlex) ** 2 + (cordy - circley) ** 2) ** 0.5;

    if (parseInt(circleobj.style.width) <= window.innerHeight) {
      circleobj.style.height = circleobj.style.width;
    } else {
      circleobj.style.height = window.innerHeight;
    }

    if (parseInt(circleobj.style.width) > window.innerHeight) {
      if (circlemodeborder == 0) {
        circlemodeborder = circlemodex;
      }

      let circbord =
        parseInt(circleobj.style.height) / 2 -
        (circlemodex - circlemodeborder) * 5;

      circleobj.style.borderRadius = circbord < 0 ? 0 : circbord + "px";
    }

    if (!(parseInt(circleobj.style.width) > window.innerHeight)) {
      youCursor.style.top = globalcords[0];
      youCursor.style.left = globalcords[1];
    } else {
      youCursor.style.top = -69;
      youCursor.style.left = -59;
    }

    socket.emit("location", {
      x: globalcords[1],
      y: globalcords[0]
    });

    return;
  }

  youCursor.style.top = globalcords[0];
  youCursor.style.left = globalcords[1];

  socket.emit("location", {
    x: globalcords[1],
    y: globalcords[0]
  });

  if (nextX < document.body.clientWidth - 16 && nextX > 0) {
    globalcords[1] = nextX;
    last2x = last2x.slice(1);
    last2x.push(e.movementX);
  } else if (nextX < 0) {
    globalcords[1] = 0;
    last2xav = !last2x
      .map(e => {
        return e < -12;
      })
      .includes(false);

    if (last2xav) audio.play();
    last2x = [0, 0, 0, 0];
  } else if (nextX > document.body.clientWidth - 16) {
    globalcords[1] = document.body.clientWidth - 16;

    last2xav = !last2x
      .map(e => {
        return e > 12;
      })
      .includes(false);

    if (last2xav) audio.play();
    last2x = [0, 0, 0, 0];
  }

  if (nextY > 0 && nextY < document.body.clientHeight - 26)
    globalcords[0] = nextY;
}

socket.on("usermove", obj => {
  if (obj.token == you) {
    return;
  }
  if (users[obj.token]) {
    users[obj.token].obj.style.left = obj.x;
    users[obj.token].obj.style.top = obj.y;
  } else {
    let newguy = document.createElement("img");
    newguy.id = obj.token;
    newguy.src = "/static/mouse.png";
    newguy.width = 16;
    newguy.style.top = obj.y;
    newguy.style.left = obj.x;
    users[obj.token] = { x: obj.x, y: obj.y, obj: newguy };
    document.body.appendChild(newguy);
  }
});
