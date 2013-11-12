var Games, Messages, Players, GameStates;

Games = new Meteor.Collection("games");
//{game_name, player_count, turn_count}
Meteor.publish("games", function() {
  return Games.find({});
});

GameStates = new Meteor.Collection("gamestates");
//{game_name, player_count}
Meteor.publish("gamestates", function(gameId) {
	return GameStates.find({
		game_id: gameId
	});
});

Players = new Meteor.Collection("players");
//{game_id}
Meteor.publish("players", function(gameId) {
  return Players.find({
    game_id: gameId
  });
});

Messages = new Meteor.Collection("messages");
//{player_id, game_id, msg, msg_type, timestamp}
Meteor.publish("messages", function(gameId) {
  return Messages.find({
    game_id: gameId
  });
});

Meteor.startup(function() {

  if (Games.find().count() != 0) {
	Games.remove({});
  }
  
  if (GameStates.find().count() != 0) {
		GameStates.remove({});
  }
  
  if (Players.find().count() != 0) {
	Players.remove({});
  }
	  
  if (Messages.find().count() != 0) {
	Messages.remove({});
  }
  
  Meteor.methods({
	  joinGame: function (playerId) {
		var gameDoc, gameId;
		gameDoc = Games.findOne({player_count: {$lt: 2}});
		//console.log(gameDoc);
		if(typeof(gameDoc) == 'undefined') {
			gameName = "Antakshari" + (Math.floor(Math.random() * 1000));
			gameDoc = Games.insert({
				game_name: gameName,
				player_count: 1,
				turn_count: 0,
			});
			gameId = gameDoc;
			playerCount = 1;
		} else {
			Games.update(gameDoc._id, {$inc: {player_count: 1}});
			gameId = gameDoc._id;
			gameName = gameDoc.game_name;
			playerCount = 2;
		}
		return {game_name: gameName, game_id: gameId, player_count: playerCount};
	  }
  });
});


