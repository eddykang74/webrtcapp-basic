const SocketIO = require('socket.io');

module.exports =(server)=>{

    const io = SocketIO(server,{path:'/socket.io'});

    //전체 소켓 연결 사용자 목록 저장 배열 
    let connectionUsers = [];
    

    io.on('connection',(socket)=>{

        //websocket기반 httprequest객체 추출
        const req = socket.request;

        //사용자 ip 주소 추출
        const userIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress;//사용자IP
        
        //현재 연결된 클라이언트에게 부여된 socketid(서버에서 인식하는 사용자 세션번호)
        const socketID = socket.id; //소켓연결ID

        //서버 소켓에 연결로깅
        console.log(`${socketID} - 사용자가 연결되었습니다.`);

        socket.on("disconnect", async () => {
            await UserConnectionOut();
        });

        //최종 채팅종료 처리 함수
        async function UserConnectionOut(){
        }


        //1:1 채팅방 입장처리 
        socket.on('entryRoom',async(roomName,nickName)=>{

            //1.채팅방 정보 및 접속자 정보조회
            const sockets = await io.in(roomName).fetchSockets();

            //지정 채팅방 현재 접속자수
            var groupUserCnt = sockets.length;
            
            //서버소켓에 지정채팅방에 접속처리
            //해당 사용자 connectionID(세션-서버에서 클라이언틀 인식표)를 해당 그룹으로 묶어주는 기능..   
            socket.join(roomName);

            //현재 입장 사용자정보 데이터 추출
            var entryUser = {
                socketId: socket.id,
                userId :nickName,
                roomId :roomName,
                userIp:userIP,
                entryDt:Date.now()
            };

            //현재 접속자 정보를 배열에 추가한다.
            connectionUsers.push(entryUser);



            //접속자수 추가 
            groupUserCnt +=1;

            //접속자 초과시
            if(groupUserCnt > 2 ){
                socket.emit('entryDeny',"일대일 채팅방의 사용자가 초과되었습니다.");
                //이후 프로세스 진행을 멈추고 종료한다.
                return;
            }

            //현재 해당 이벤트 수신기를 호출한(현재입장한)사용자에게만 메시지 발송
            socket.emit('entryResult',`환영합니다. ${roomName} 채팅방에 입장했습니다.`,groupUserCnt);

            //현재 접속자를 제외한 같은 채팅방내 모든 다른사용자에게 메시지 발송
            if(groupUserCnt == 2){
                //기 접속한 사용자에게만 메시지를 보낸다.
                //Caller에게만 메시지 발송
                socket.to(roomName).emit("entryOk",`${nickName}님이 채팅방에 입장해서 모든사용자가 입장완료했습니다.`,groupUserCnt);
            }
     
        });

        
        //그룹채팅 메시지 수신처리
        socket.on('send',async(roomName,nickName,msg)=>{
            //지징한 채팅방내 자신을 포함한 모든 사용자에게 메시지 발송하기 
            io.to(roomName).emit('getMessage',`${nickName}:${msg}`);
        });


        //PeerConnection SDP교환및 ice Candiate과정에 필요한 모든 서버 메시지 수신기
        socket.on("message", function (room,message) {

            //나를 제외한 채널내 사용자에게 브로드 캐스팅처리
            //상대방에게만 내 메시지를 전송한다.
            socket.broadcast.to(room).emit("message",message);
        });
        
    });


}