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
        $("#chat").html("Getting Rooms!!!!");
        _warpclient.getAllRooms();
    }
    else
    {
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
    roomsText += '<li><a href="#" onClick="joinRoom(\''+room.getRoom().getRoomId()+'\')">' + room.getRoom().getName() + '</a></li>';
    $("#roomsList").html(roomsText);
    $("#chat").html("Select a room");
}

function onJoinRoomDone(room)
{
    if(room.getResult() == AppWarp.ResultCode.Success)
    {
        _warpclient.subscribeRoom(room.getRoomId());
    }
}

function onSubscribeRoomDone(room)
{
    if(room.getResult() == AppWarp.ResultCode.Success)
    {
        inRoom = true;
        roomId = room.getRoomId();
        $("#roomInfo").html("Joined Room : " + room.getName());
        $("#chat").html("");
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
    $("#chat").html("<dt class='text-danger'>"+chat.getSender() + "</dt><dd class='text-primary'>" + chat.getChat() + "</dd>" + $("#chat").html());
}

function joinRoom(id)
{
    if(inRoom == false)
    {
        _warpclient.joinRoom(id);
    }
}

function leaveRoom()
{
    _warpclient.leaveRoom(roomId);
    $("#roomInfo").html("Connected");
}

$(document).ready(function(){
    $("#roomsRow").hide();
    $("#nameBtn").click(function(){
        
		if($("#nameText").val() != "")
		{
			nameId = $("#nameText").val();
			
			$("#nameRow").hide();
			$("#roomsRow").show();
						
			$("#roomInfo").html("Connecting...");
			AppWarp.WarpClient.initialize(apiKey, secreteKey);
			_warpclient = AppWarp.WarpClient.getInstance();
			_warpclient.setResponseListener(AppWarp.Events.onConnectDone, onConnectDone);
			_warpclient.setResponseListener(AppWarp.Events.onGetAllRoomsDone, onGetAllRoomsDone);
			_warpclient.setResponseListener(AppWarp.Events.onGetLiveRoomInfoDone, onGetLiveRoomInfo);
			_warpclient.setResponseListener(AppWarp.Events.onJoinRoomDone, onJoinRoomDone);
			_warpclient.setResponseListener(AppWarp.Events.onSubscribeRoomDone, onSubscribeRoomDone);
			_warpclient.setResponseListener(AppWarp.Events.onLeaveRoomDone, onLeaveRoomDone);
			_warpclient.setResponseListener(AppWarp.Events.onUnsubscribeRoomDone, onUnsubscribeRoomDone);
			_warpclient.setNotifyListener(AppWarp.Events.onChatReceived, onChatReceived);
			_warpclient.connect(nameId);
		}
    });
	
	$("#chatBtn").click(function(){
        if(inRoom == true)
        {
            if($("#chatText").val() != "")
            {
                _warpclient.sendChat($("#chatText").val());
                $("#chatText").val("");
            }
        }
    });
});
