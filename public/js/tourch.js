var canvas, ctx, brushColor;
var mode = 1;
var lineWeight = 10;

window.onload = function () {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  ctx.strokeStyle = "#ff0000";
  ctx.lineWith = 5;

  brushColor = "#ff0000";

  window.addEventListener("resize", resizeCanvas, false);
  window.addEventListener("orientationchange", resizeCanvas, false);
  resizeCanvas();

  canvas.addEventListener("touchstart", function (event) {
    var touch = event.touches[0];
    //console.log("그리기 시작...........", touch.pageX, touch.pageY);
    var proX = (touch.pageX / canvas.width) * 100;
    var proY = (touch.pageY / canvas.height) * 100;
    //console.log("그리기 시작...........", proX, proY);
    //socket.emit("drawdown", chatRoomId, touch.pageX, touch.pageY);
    socket.emit("drawdown", chatRoomId, proX, proY);
  });

  canvas.addEventListener("touchmove", function (event) {
    event.preventDefault();
    // ctx.lineTo(event.touches[0].pageX, event.touches[0].pageY);
    // ctx.stroke();
    var proX = (event.touches[0].pageX / canvas.width) * 100;
    var proY = (event.touches[0].pageY / canvas.height) * 100;
    socket.emit("drawmove", chatRoomId, proX, proY);
  });

  canvas.addEventListener("touchend", function (event) {
    // ctx.closePath();
    // ctx.save();
    socket.emit("drawend", chatRoomId);
  });

  canvas.addEventListener("touchcancel", function (event) {
    // ctx.closePath();
    // ctx.save();
    socket.emit("drawend", chatRooomName);
  });
};

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
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


function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
}

socket.on("drawdown", function (proX, proY) {
  //console.log("소켓통신 그리기 정보 수신11....");

  ctx.beginPath();
  ctx.strokeStyle = brushColor;
  ctx.lineWidth = lineWeight;

  var posX = (proX / 100) * canvas.width;
  var posY = (proY / 100) * canvas.height;
  //console.log("소켓통신 그리기 정보 수신22....", posX, posY);
  ctx.moveTo(posX, posY);
});

socket.on("drawmove", function (proX, proY) {
  //console.log("소켓통신 실시간 그리기중11....", proX, proY);

  var posX = (proX / 100) * canvas.width;
  var posY = (proY / 100) * canvas.height;
  //console.log("소켓통신 실시간 그리기중22....", posX, posY);

  ctx.lineTo(posX, posY);
  ctx.stroke();
});

socket.on("drawend", function () {
  //console.log("소켓통신 실시간 종료");
  ctx.closePath();
  ctx.save();
});
