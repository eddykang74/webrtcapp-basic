var express = require('express');
var router = express.Router();

//메인페이지 라우팅 메소드
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//화상통화 페이지 라우팅 메소드
//localhost:3000/rtc
router.get('/rtc', function(req, res, next) {
  res.render('rtc');
});

//화상통화 템플릿 적용 샘플 페이지
//localhost:3000/sample?roomId=sample&nickName=eddy
//localhost:3000/sample?roomId=sample&nickName=eddy+
router.get('/sample', function(req, res, next) {

  const roomId = req.query.roomId;
  const nickName = req.query.nickName;

  res.render('sample',{roomId,nickName});
});



module.exports = router;
