var pos = {
  drawable: false,
  x: -1,
  y: -1,
};

var canvas, ctx, brushColor;

window.onload = function () {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  brushColor = "#ff0000";

  window.addEventListener("resize", resizeCanvas, false);
  window.addEventListener("orientationchange", resizeCanvas, false);
  resizeCanvas();

  canvas.addEventListener("mousedown", listener);
  canvas.addEventListener("mousemove", listener);
  canvas.addEventListener("mouseup", listener);
  canvas.addEventListener("mouseout", listener);
};

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function listener(event) {
  switch (event.type) {
    case "mousedown":
      initDraw(event);
      break;
    case "mousemove":
      if (pos.drawable) draw(event);
      break;
    case "mouseout":
    case "mouseup":
      finishDraw();
      break;
  }
}

function initDraw(event) {
  // ctx.beginPath();
  // pos.drawable = true;
  // var coors = getPosition(event);
  // pos.X = coors.X;
  // pos.Y = coors.Y;
  // ctx.moveTo(pos.X, pos.Y);

  var coors = getPosition(event);
  var proX = (coors.X / canvas.width) * 100;
  var proY = (coors.Y / canvas.height) * 100;

  socket.emit("drawdown", chatRoomId, proX, proY);
}

function draw(event) {
  // var coors = getPosition(event);
  // ctx.lineTo(coors.X, coors.Y);

  // pos.X = coors.X;
  // pos.Y = coors.Y;

  // ctx.strokeStyle = brushColor;
  // ctx.lineWith = 10;

  // ctx.stroke();

  var coors = getPosition(event);
  //console.log("그리기 시작2", coors.X, coors.Y);

  var proX = (coors.X / canvas.width) * 100;
  var proY = (coors.Y / canvas.height) * 100;

  //console.log("그리기 시작2", proX, proY);

  socket.emit("drawmove", chatRoomId, proX, proY);
}

function finishDraw() {
  // pos.drawable = false;
  // pos.X = -1;
  // pos.Y = -1;
  socket.emit("drawend", chatRoomId);
}

function getPosition(event) {
  var x = event.pageX - canvas.offsetLeft;
  var y = event.pageY - canvas.offsetTop;
  return { X: x, Y: y };
}

$("#clearCanvas").click(function () {
  //console.log("캔버스 지우기 클릭실행");
  clearCanvas();
});

$("#brush1").click(function () {
  brushChange("#FF0000");
});

$("#brush2").click(function () {
  brushChange("#FFCC00");
});

$("#brush3").click(function () {
  brushChange("#00FF00");
});

//컬러코드변경 처리 
function brushChange(colorCode){
  brushColor = colorCode;

  //컬러코드 변경알림
  socket.emit("brushChange", chatRoomId, brushColor);
}

//브러시 색상코드 변경 알림 수신 적용
socket.on("brushChanged", function (colorCode) {
  brushColor = colorCode;
});


//캔버스 드로잉 초기화 하기 
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
}

socket.on("drawdown", function (proX, proY) {
  //console.log("소켓통신 그리기 시작");
  var posX = (proX / 100) * canvas.width;
  var posY = (proY / 100) * canvas.height;

  ctx.beginPath();
  pos.X = posX;
  pos.Y = posY;
  pos.drawable = true;
  ctx.moveTo(posX, posY);
});

socket.on("drawmove", function (proX, proY) {
  //console.log("소켓통신 실시간 그리기중....");

  var posX = (proX / 100) * canvas.width;
  var posY = (proY / 100) * canvas.height;

  if (pos.drawable) {
    ctx.lineTo(posX, posY);

    pos.X = posX;
    pos.Y = posY;

    ctx.strokeStyle = brushColor;
    ctx.lineWith = 10;

    ctx.stroke();
  }
});

socket.on("drawend", function () {
  //console.log("소켓통신 실시간 종료");
  pos.drawable = false;
  pos.X = -1;
  pos.Y = -1;
});
