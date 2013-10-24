var apiKey = "4f4dfd297a567c28c8febe7858d7cd8d51827196d81cdd6b98eead4fd6bb97f9";
var secreteKey = "609aa42d46f3c18137d8721faa9c0266439669861beba6638b9574ea90332d05";

var _warpclient;
var nameId = "";
var roomsText = "";
var inRoom = false;
var roomId = "";

function onConnectDone(res)
{
    if(res == AppWarp.ResultCode.Success)
    {
        $("#roomInfo").html("Connected");
        $("#chat").html("Getting Rooms & Creating Dynamic Room...");
        _warpclient.getAllRooms();
        
        experiment(_warpclient);
    } else {
        $("#roomInfo").html("Error in Connection");
    }
}

function onGetAllRoomsDone(rooms)
{
    roomsText = "";
    $("#roomsList").html(roomsText);
    for(var i=0; i<rooms.getRoomIds().length; ++i)
    {
        _warpclient.getLiveRoomInfo(rooms.getRoomIds()[i]);
    }
    
}

function onGetLiveRoomInfo(room)
{
    console.log("onGetLiveRoomInfo");
    roomsText += '<li><a href="#" onClick="joinRoom(\''+room.getRoom().getRoomId()+'\')">' + room.getRoom().getName() + '</a></li>';
    $("#roomsList").html(roomsText);
    $("#chat").html("Select a room");
}

function onJoinRoomDone(room)
{
    console.log("onJoinRoomDone: " + room.getResult());
    if(room.getResult() == AppWarp.ResultCode.Success)
    {
        console.log("onJoinRoomDone");
        _warpclient.subscribeRoom(room.getRoomId());
    }
}

function onSubscribeRoomDone(room)
{
    if(room.getResult() == AppWarp.ResultCode.Success)
    {
        inRoom = true;
        roomId = room.getRoomId();
        $("#roomInfo").html("Joined Room: " + room.getName());
        $("#chat").html("Welcome to Room: " + room.getName());
        $("#roomsList").html('<button id="leaveBtn" onClick="leaveRoom()" type="button" class="btn btn-primary">Leave Room</button>');
    }
}

function onLeaveRoomDone(room)
{
    if(room.getResult() == AppWarp.ResultCode.Success)
    {
        _warpclient.unsubscribeRoom(room.getRoomId());
    }
}

function onUnsubscribeRoomDone(room)
{
    if(room.getResult() == AppWarp.ResultCode.Success)
    {
        inRoom = false;
        _warpclient.getAllRooms();
        $("#chat").html("");
    }
}

function onChatReceived(chat)
{	
	imgsrc = 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-prn1/c5.5.65.65/s50x50/282965_468653659847682_8020574_t.jpg';
    $("#chat").html($("#chat").html() + "<dd><img class='profilepic' src='"+imgsrc+"' alt=''><div class='chatTextBlock'><span class='text-danger'>" + chat.getSender() + "</span><span class='text-primary'>" + chat.getChat() + "</span></div></dd>" );
}

function joinRoom(id)
{
    console.log('Request joinRoom: ' + id);
    if (inRoom == false)
    {
        _warpclient.joinRoom(id);
    } else {
        console.warn('Already in another room: ' + roomId);
    }
}

function leaveRoom()
{
    _warpclient.leaveRoom(roomId);
    $("#roomInfo").html("Connected");
}

function setListeners(_warpclient) {
	_warpclient.setResponseListener(AppWarp.Events.onConnectDone, onConnectDone);
	_warpclient.setResponseListener(AppWarp.Events.onGetAllRoomsDone, onGetAllRoomsDone);
	_warpclient.setResponseListener(AppWarp.Events.onGetLiveRoomInfoDone, onGetLiveRoomInfo);
	_warpclient.setResponseListener(AppWarp.Events.onJoinRoomDone, onJoinRoomDone);
	_warpclient.setResponseListener(AppWarp.Events.onSubscribeRoomDone, onSubscribeRoomDone);
	_warpclient.setResponseListener(AppWarp.Events.onLeaveRoomDone, onLeaveRoomDone);
	_warpclient.setResponseListener(AppWarp.Events.onUnsubscribeRoomDone, onUnsubscribeRoomDone);
	_warpclient.setResponseListener(AppWarp.Events.onCreateRoomDone, onCreateRoomDone);
    _warpclient.setResponseListener(AppWarp.Events.onSendMoveDone, onSendMoveDone);
    
    _warpclient.setNotifyListener(AppWarp.Events.onChatReceived, onChatReceived);
    _warpclient.setNotifyListener(AppWarp.Events.onMoveCompleted, onMoveCompleted);
    
}

function onCreateRoomDone(room) {
    console.log("onCreateRoomDone");

    if(room.getResult() == AppWarp.ResultCode.Success)
    {
        roomId = room.getRoomId();
        console.log("Room ID: " + roomId);
        _warpclient.getLiveRoomInfo(roomId);
    }
}

function experiment(wc) {
    wc.createTurnRoom("TurnRoom", "MK", 2, null, 10);
    console.log("Create Turn Room Invoked");
}

function sendMove(msg) {
    console.log('sendMove: ' + msg);
    _warpclient.sendMove(msg);
}

function onSendMoveDone(event) {
    console.log('onSendMoveDone: Event#' + event);
}

function onMoveCompleted(moveData) {
    console.log('onMoveCompleted: ');
    console.log(moveData);
}

$(document).ready(function(){
    $("#roomsRow").hide();

    //TODO/FIXME: Trigger on enter key.
    $("#nameBtn").click(function(){
        
		if ($("#nameText").val() != "")
		{
			nameId = $("#nameText").val();
			
			$("#nameRow").hide();
			$("#roomsRow").show();
						
			$("#roomInfo").html("Connecting...");
			AppWarp.WarpClient.initialize(apiKey, secreteKey);
			_warpclient = AppWarp.WarpClient.getInstance();
			setListeners(_warpclient);
			_warpclient.connect(nameId);
		}
    });
	
	$("#chatBtn").click(function(){
        if (inRoom == true)
        {
            chatMessage = $("#chatText").val();
            //TODO: Important! Do Sanity Check / SQL Injection (Bobby Tables)!

            if ( chatMessage != "")
            {
                _warpclient.sendChat(chatMessage);
                sendMove(chatMessage);
                /*
                if (room.type == turnbased ) {
                    // if (true == isValidMovieName(chatMessage)) 
                    // need this to avoid accidental matching of chatText to MovieName
                    sendMove(chatMessage);        
                }
                */
                $("#chatText").val(""); 
            }
        }
    });
});