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
        $("#chat").html("Fetching Rooms & Users...");
        _warpclient.getAllRooms();
        _warpclient.getOnlineUsers();
        
        // Create Dynamic Turn Based Room 
        // experiment(_warpclient);

        //This would Quickly Join a room (if exists) with 1 user in it. 
        _warpclient.joinRoomInRange(1,1,1);
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
    /* Delete Dead Turn Rooms
    if (room.getRoom().getName() == 'TurnRoom') {
        _warpclient.deleteRoom(room.getRoom().getRoomId());
        return;
    }  */

    //Populate Room List
    //console.log("onGetLiveRoomInfo: " + room.getRoom().getName());
    roomsText += '<li><a href="#" onClick="joinRoom(\''+ room.getRoom().getRoomId() +'\')">' + room.getRoom().getName() + '(' + room.getUsers().length + ')</a></li>';

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
        $("#chat").html("Welcome to Room: " + room.getName() + '<br>');
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

//Join and Subscribe a Chat Room
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

function onGetOnlineUsersDone(userList) {
    console.log('onGetOnlineUsersDone');
    console.log(userList);

    if (userList.getResult() == AppWarp.ResultCode.Success)
    {
        usernames = userList.getUsernames();
        
        usersText = "";
        $("#usersList").html(usersText);

        for(var i=0; i<usernames.length; ++i)
        {
            usersText += '<li id=\"'+ usernames[i] +'\">'+ usernames[i] +'</li>';
        }
        $("#usersList").html(usersText);
    }
}

function onDeleteRoomDone(room) {
    console.log('onDeleteRoomDone: ');
    
    if (room.getResult() == AppWarp.ResultCode.Success)
    {   
        console.log(room.getName() + 'id: ' + room.getRoomId());
    }
}

function onGetMatchedRoomsDone(matchedRoomEvent) {
    console.log('onGetMatchedRoomsDone: ');
    
    if (matchedRoomEvent.getResult() == AppWarp.ResultCode.Success) {
        roomList = matchedRoomEvent.getRooms();

        for (var i=0; i<roomList.length; i++) {
            console.log(roomList[i].name);
        }
    }
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
    _warpclient.setResponseListener(AppWarp.Events.onGetOnlineUsersDone, onGetOnlineUsersDone);
    _warpclient.setResponseListener(AppWarp.Events.onDeleteRoomDone, onDeleteRoomDone);
    _warpclient.setResponseListener(AppWarp.Events.onGetMatchedRoomsDone, onGetMatchedRoomsDone);
    
    _warpclient.setNotifyListener(AppWarp.Events.onChatReceived, onChatReceived);
    _warpclient.setNotifyListener(AppWarp.Events.onMoveCompleted, onMoveCompleted);
    _warpclient.setNotifyListener(AppWarp.Events.onUserJoinedRoom, onUserJoinedRoom);
    _warpclient.setNotifyListener(AppWarp.Events.onUserLeftRoom, onUserLeftRoom);

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
    wc.createTurnRoom("TurnRoom", "MK", 2, null, 1000);
    console.log("Create Turn Room Invoked");
}

function sendMove(msg) {
    console.log('sendMove: ' + msg);
    _warpclient.sendMove(msg);
}

function onSendMoveDone(move) {
    console.log('onSendMoveDone: Event#' + move);
}

function onMoveCompleted(move) {
    console.log('onMoveCompleted: ');
    console.log(move);

    //populate UI
    chatHtml = $("#chat").html();
    chatHtml += move.getSender() +  ' Played a Move: \"' + move.getMoveData() + '\"';
    //chatHtml += '<br> Next Turn: ' + ;

    $("#usersList #" + move.getSender()).removeClass('NextTurn');
    $("#usersList #" + move.getNextTurn()).addClass('NextTurn');

    $("#chat").html(chatHtml);
}

function onUserJoinedRoom (room, username) {
    //TODO: Add a css class to system message
    systemMsg = username + ' Joined Room <br>';
    $("#chat").html($("#chat").html() + systemMsg);
}

function onUserLeftRoom (room, username) {
    //TODO: Add a css class to system message
    systemMsg = username + ' Left Room <br>';
    $("#chat").html($("#chat").html() + systemMsg);
}

function onMovieSearchDone (mInfo) {
	//console.log(mInfo);
	//_warpclient.sendChat(mInfo.poster);
	if(mInfo.poster != "na") {
		_warpclient.sendChat("<dd align=center><img heght=80 width=80 class='profilepic' src='" + mInfo.poster +
				"' alt=''/><br><div class='chatTextBlock'><span class='text-primary'>" + mInfo.title 
				+ "</span></div></dd>");
		sendMove(mInfo.title);
	} else {
		console.log("movie/poster not found");
		_warpclient.sendChat(mInfo.title[0]);
	}

}

//initialize AppWarp
function Init() {
    AppWarp.WarpClient.initialize(apiKey, secreteKey);
    _warpclient = AppWarp.WarpClient.getInstance();
    setListeners(_warpclient);
}


//Does not need DOM.
Init();

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
            	movieSearch.getMovieInfo(chatMessage);
                //_warpclient.sendChat(chatMessage);
                //sendMove(chatMessage);
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
	movieSearch.setCallback(onMovieSearchDone);
});