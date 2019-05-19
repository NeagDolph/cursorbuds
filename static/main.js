var bodyEle = document.body;
var locked = false;
var audio = new Audio("/static/ting.mp3");
var youCursor = document.getElementById("geed");
socket = io();

console.log(users);
Object.entries(users).map(e => {
  if (e[0] == you) {
    youCursor.style.left = e[1].x;
    youCursor.style.top = e[1].y;
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
  if (locked) return;
  bodyEle.requestPointerLock =
    bodyEle.requestPointerLock ||
    bodyEle.mozRequestPointerLock ||
    bodyEle.webkitRequestPointerLock;
  bodyEle.requestPointerLock();
  console.log("e", e);
  youCursor.style.left = e.pageX;

  youCursor.style.top = e.pageY;
};

document.addEventListener("pointerlockchange", changeCallback, false);

function changeCallback(e) {
  if (
    document.pointerLockElement === bodyEle ||
    document.mozPointerLockElement === bodyEle ||
    document.webkitPointerLockElement === bodyEle
  ) {
    // Pointer was just locked
    // Enable the mousemove listener
    document.addEventListener("mousemove", moveCallback, false);
    locked = true;
  } else {
    // Pointer was just unlocked
    // Disable the mousemove listener
    document.removeEventListener("mousemove", moveCallback, false);
    locked = false;
  }
}

var last2x = [0, 0];

//average
var last2xav = 0;

// var last4y = [0, 0, 0, 0];

// //average
// var last4yav = 0;

function moveCallback(e) {
  var nextY = parseInt(youCursor.style.top.slice(0, -2)) + e.movementY;

  var nextX = parseInt(youCursor.style.left.slice(0, -2)) + e.movementX;

  // last2x = last2x.slice(1);
  // last2x.push(e.movementX);
  // last2xav = last2x.reduce((partial_sum, a) => partial_sum + a, 0) / 2;

  if (nextX < document.body.clientWidth - 16 && nextX > 0) {
    youCursor.style.left = nextX;
    last2x = last2x.slice(1);
    last2x.push(e.movementX);
  } else if (nextX < 0) {
    youCursor.style.left = 0;
    // console.log(last2xav);
    last2xav = !last2x
      .map(e => {
        return e < -12;
      })
      .includes(false);

    if (last2xav) audio.play();
    last2x = [0, 0, 0, 0];
  } else if (nextX > document.body.clientWidth - 16) {
    youCursor.style.left = document.body.clientWidth - 16;

    last2xav = !last2x
      .map(e => {
        return e > 12;
      })
      .includes(false);

    if (last2xav) audio.play();
    last2x = [0, 0, 0, 0];
  }

  if (nextY > 0 && nextY < document.body.clientHeight - 26)
    youCursor.style.top = nextY;

  socket.emit("location", {
    x: youCursor.style.left,
    y: youCursor.style.top
  });
}

socket.on("usermove", obj => {
  if (obj.token == you) {
    console.log("yuouuu");
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
