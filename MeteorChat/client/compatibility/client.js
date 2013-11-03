var apiKey = "4108cfe453414abf3bc1d516576aeaf6122303b9a0a483906f65caf6673a2652";
var secreteKey = "df76a5fc36cb696f6657cfa7f67c729ca03186ca101195bce1820646d72a8c0f";

var _warpclient;
var nameId = "";
var roomsText = "";
var inRoom = false;
var roomId = "";

function status(type, msg) {
    var alertHTML = "<div class='alert alert-message alert-" + type + " fade' data-alert><p> " + msg + " </p></div>";
    
    $("#roomInfo").html(alertHTML);
    $(".alert-message").addClass("in");
    
    setTimeout(function () {
      $(".alert-message").removeClass("in");
    }, 3000);
}

function onConnectDone(res)
{
    if(res == AppWarp.ResultCode.Success)
    {
        status("info", "Select Room");
        _warpclient.getAllRooms();
        
        //This would Quickly Join a room (if exists) with 1 user in it. 
        console.log("Attempting a Quick Join...");
        // TODO: Check if its a Dynamic Turn Room.
        _warpclient.joinRoomInRange(1,1,1);
    } else {
        status("danger", "Error in Connection");
    }
}

function onDisconnectDone(res) {
    if(res == AppWarp.ResultCode.Success)
    {
    	console.log(res);
        console.log("Disconnected from appwarp");
    } else {
        status("danger", "Error in Closing appwarp Connection");
    }
}
function onGetAllRoomsDone(rooms)
{
    // Populate Room List
    roomsText = "";
    $("#roomsList").html(roomsText);
    for(var i=0; i<rooms.getRoomIds().length; ++i)
    {
        _warpclient.getLiveRoomInfo(rooms.getRoomIds()[i]);
    }
}

function onGetLiveRoomInfoDone(room)
{
    // 1. 
    /* Delete Dead TurnRooms
    if (room.getRoom().getName() == 'TurnRoom') {
        _warpclient.deleteRoom(room.getRoom().getRoomId());
        return;
    }  */

    // 2. 
    // Populate Room List
    console.log("onGetLiveRoomInfoDone: " + room.getRoom().getName());
    var roomNumber = room.getRoom().getRoomId();

    // BUG: TODO: FIXME: Get all rooms but don't change their applied class.
    if ($("#roomsList #"+roomNumber).length == 0) {
        console.log($("#roomsList #"+roomNumber).html());
        $("#roomsList").append('<li id='+roomNumber+'><a href="#" onClick="joinRoom(\''+ roomNumber +'\')">' + room.getRoom().getName() + '(' + room.getUsers().length + ')</a></li>');
    }
}

function onJoinRoomDone(room)
{
    result = room.getResult();
    console.log("onJoinRoomDone: " + room.getName() + ' Result: ' + result);
    
    if(result == AppWarp.ResultCode.Success) 
    {
        console.log("onJoinRoomDone");
        _warpclient.subscribeRoom(room.getRoomId());
    } 
    else if (result == AppWarp.ResultCode.ResourceNotFound) 
    {
        // Create Dynamic Turn Based Room 
        _warpclient.createTurnRoom("Antakshari with Vijay", "Admin", 2, null, 1000);
        console.log("Create Turn Room Invoked");
    } 
    else 
    {
        console.Error('Uncaught Join Room Error!');
    }
}

function onSubscribeRoomDone(room)
{
    if(room.getResult() == AppWarp.ResultCode.Success)
    {
        inRoom = true;
        roomId = room.getRoomId();
        console.log("onSubscribeRoomDone: Add Class");

        $("#roomsList #"+roomId).addClass("active");
        $("#chat").html("Welcome to Room: " + room.getName() + '<br>');
        status("info", "Joined: " + room.getName());
    }
}

function onLeaveRoomDone(room)
{
    console.log("onLeaveRoomDone: Remove Class");
    $("#roomsList #"+roomId).removeClass("active");
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
	imgsrc = 'http://graph.facebook.com/' + Meteor.user().services.facebook.id + '/picture?width=32';
    $("#chat").html($("#chat").html() + "<dd><img class='profilepic' src='"+imgsrc+"' alt=''><div class='chatTextBlock'><span class='text-danger'>" + chat.getSender() + "</span><span class='text-primary'>" + chat.getChat() + "</span></div></dd>" );
    //$('#chat-window').scrollTop($('#chat-window').scrollHeight);
    $('#chat-window').animate({scrollTop: $('#chat-window').scrollHeight}, 'slow');
    //var div = $('#chat-window');
    //setInterval(function(){
    //    var pos = div.scrollTop();
    //    div.scrollTop(pos + 2);
    //}, 0)
    
}

//Join and Subscribe a Chat Room
function joinRoom(id)
{
    console.log('Request joinRoom: ' + id);
    // TODO: Remove Globals
    if (inRoom == true)
    {
        console.log('Leaving room: ' + roomId);
        // Should this be a synchronous call?
        // TODO: Remove Globals
        leaveRoom();
    }
    _warpclient.joinRoom(id);
}

function leaveRoom()
{
    _warpclient.leaveRoom(roomId);
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
	_warpclient.setResponseListener(AppWarp.Events.onDisconnectDone, onDisconnectDone);
	_warpclient.setResponseListener(AppWarp.Events.onGetAllRoomsDone, onGetAllRoomsDone);
	_warpclient.setResponseListener(AppWarp.Events.onGetLiveRoomInfoDone, onGetLiveRoomInfoDone);
	_warpclient.setResponseListener(AppWarp.Events.onJoinRoomDone, onJoinRoomDone);
	_warpclient.setResponseListener(AppWarp.Events.onSubscribeRoomDone, onSubscribeRoomDone);
	_warpclient.setResponseListener(AppWarp.Events.onLeaveRoomDone, onLeaveRoomDone);
	_warpclient.setResponseListener(AppWarp.Events.onUnsubscribeRoomDone, onUnsubscribeRoomDone);
	_warpclient.setResponseListener(AppWarp.Events.onCreateRoomDone, onCreateRoomDone);
    _warpclient.setResponseListener(AppWarp.Events.onSendMoveDone, onSendMoveDone);
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

function sendMove(msg) {
    console.log('sendMove: ' + msg);
    _warpclient.sendMove(msg);
}

function onSendMoveDone(move) {
    console.log('onSendMoveDone: Event#' + move);
    // return failed. Not count as Move.
}

function onMoveCompleted(move) {
    console.log('onMoveCompleted: ');
    console.log(move);

    //populate UI
    chatHtml = $("#chat").html();
    chatHtml += move.getSender() +  ' Played a Move: \"' + move.getMoveData() + '\"';
    //chatHtml += '<br> Next Turn: ' + ;

    //TODO: Next Turn Notification UI

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
	
	if (mInfo.found == "false") {
		console.log("movie not found");
		_warpclient.sendChat(mInfo.title);
	} else {
		if (mInfo.poster == "NA") {
			console.log("poster not found");
			_warpclient.sendChat(mInfo.title);
			sendMove(mInfo.title);
		} else {
			console.log("movie and poster found");
			_warpclient.sendChat("<dd align=center><img heght=80 width=80 class='profilepic' src='" + mInfo.poster +
					"' alt=''/><br><div class='chatTextBlock'><span class='text-primary'>" + mInfo.title 
					+ "</span></div></dd>");
			sendMove(mInfo.title);
		}
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
    //Init();
    //TODO/FIXME: Trigger on enter key.
    /*$("#nameBtn").click(function(){
        
		if ($("#nameText").val() != "")
		{
			nameId = $("#nameText").val();
			
			$("#nameRow").hide();
			$("#roomsRow").show();
						
			_warpclient.connect(nameId);
		}
    });*/
	
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

