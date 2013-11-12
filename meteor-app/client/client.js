var Games, Messages, Players, GameStates;

Games = new Meteor.Collection("games");
//{game_name, player_count, turn_count}

GameStates = new Meteor.Collection("gamestates");
//{game_id, player_id, game_score, is_turn, turn_count, lastmove_timestamp}

Players = new Meteor.Collection("players");
//{game_id}

Messages = new Meteor.Collection("messages");
//{game_id, player_id, msg, msg_type, timestamp}

//PlayerSessions = new Meteor.Collection("player_sessions");
//{game_id, player_id, game_score, is_turn, turn_count, lastmove_timestamp}

Session.set('game_id', null);

Session.set('player_id', null);

Session.set('player_name', null);

Meteor.startup(function() {
  setMovieSearchCallback(onMovieSearchDone);
  var player, playerName, gameSession;
  if (!Session.get('player_id')) {
      playerName = "Guest" + (Math.floor(Math.random() * 1000));
      Session.set('player_name', playerName);
    player = Players.insert({
      player_name: playerName,
      player_score: 0
    });
    //return Session.set('player_id', player);
    Session.set('player_id', player);
    var playerId = Session.get('player_id');
    if (!Session.get('game_id')) {
  	Meteor.call('joinGame', playerId, function (error, result) {
  		//console.log(result);
  		var turnInd, isTurn;
  		if(result.player_count == 1) {
  			turnInd = 0;
  			isTurn = true;
  		} else {
  			turnInd = 1;
  			isTurn = false;
  		}
  		gameSession = GameStates.insert({
  			game_name: result.game_name,
  			player_name: playerName,
  			player_id: playerId,
  			game_id: result.game_id,
  			game_score:0,
  			turn_ind: turnInd,
  			is_turn: isTurn
  		});
  		return Session.set('game_id', result.game_id);
  		//return Session.set('game_id', gameSession);
  	});
    }
  }
});

Meteor.subscribe('games', function() {

});

Meteor.subscribe('gamestates', function(gameId) {
	  return GameStates.find({
		  game_id: gameId
	  });
});

Meteor.autosubscribe(function() {
  var gameId;
  gameId = Session.get('game_id');
  playerId = Session.get('player_id');
  if (playerId && gameId) {
    Players.update(playerId, {
      $set: {
        game_id: gameId
      }
    });
    Meteor.subscribe('gamestates', gameId);
    return Meteor.subscribe('messages', gameId);
  }
});

isTurn = function(playerId, gameId) {
	var turn_count = Games.findOne(gameId, {fields:{turn_count : 1}}).turn_count;
	var turn_ind = GameStates.findOne({player_id: playerId, game_id:gameId}, {fields:{turn_ind : 1}}).turn_ind;
	if (turn_count%2 == turn_ind)
		return true;
	else
		return false;
};

Template.input.events = {
  'keyup': function(event) {
    var $inputForm, $messageDialog;
    if (event.which === 13) {
      $inputForm = $('#footer input');
      $messageDialog = $('#messages');
      if ($inputForm.val()) {
    	  if(isTurn(Session.get('player_id'), Session.get('game_id'))) {
    		  getMovieSearchResult($inputForm.val());
    	  } else {
    		  console.log($inputForm.val());
    	  }
      }
      $inputForm.val("");
      $inputForm.focus();
      return $messageDialog.scrollTop(9999999);
    }
  }
};

Template.players.players = function() {
  var gameId, sel;
  gameId = Session.get('game_id');
  //console.log(gameId);
  if (!gameId) {
    ({});
  }
  sel = {
    game_id: gameId
  };
  return GameStates.find(sel, {
    sort: {
      player_name: 1,
    }
  });
};

Template.players.is_turn = function() {
	var turn_count = Games.findOne(this.game_id, {fields:{turn_count : 1}}).turn_count;
	if (turn_count%2 == this.turn_ind)
		return true;
	else
		return false;
	//return Games.findOne(this.game_id, {fields:{turn_count : 1}}).turn_count;
};

Template.messages.messages = function() {
  var game_id, sel;
  game_id = Session.get('game_id');
  if (!game_id) {
    ({});
  }
  sel = {
    game_id: game_id
  };
  return Messages.find(sel, {
    sort: {
      timestamp: 1
    }
  });
};

Template.messages.poster_found = function() {
	if(this.poster == null)
		return false;
	else
		return true;
};

Template.games.gamestates = function() {
	  return GameStates.find({
		  player_id: Session.get('player_id')
	  });
};

Template.games.state = function() {
	  if (Session.equals('game_id', this.game_id)) {
	    return 'disabled';
	  } else {
	    return '';
	  }
};

Template.games.turn_count = function() {
	return Games.findOne(this.game_id, {fields:{turn_count : 1}}).turn_count;
};

Template.games.is_turn = function() {
	var turn_count = Games.findOne(this.game_id, {fields:{turn_count : 1}}).turn_count;
	if (turn_count%2 == this.turn_ind)
		return true;
	else
		return false;
	//return Games.findOne(this.game_id, {fields:{turn_count : 1}}).turn_count;
};

Template.games.events = {
	  'click .gameBtn': function(event) {
	    return Session.set('game_id', this._id);
	  },
	  
	  'click #newGame': function() {
		var gameName = "Antakshari" + (Math.floor(Math.random() * 1000));
		var playerId = Session.get('player_id');
		var playerName = Session.get('player_name');
		var gameDoc;
		gameDoc = Games.insert({
		    game_name: gameName,
		    player_count: 1,
		    turn_count: 0,
		});
  		gameSession = GameStates.insert({
  			player_name: playerName,
  			game_name: gameName,
  			player_id: playerId,
  			game_id: gameDoc,
  			game_score:0,
  			turn_ind: 0,
  			is_turn: true
  		});
	  }
};
	
onMovieSearchDone = function(mInfo) {
	if (mInfo.found == "false") {
		console.log("movie not found");
		poster = null;
	} else {
		if (mInfo.poster == "NA") {
			console.log("poster not found");
			poster = null;
		} else {
			console.log("movie and poster found");
			poster = mInfo.poster;
		}
	}
	movie = mInfo.title;
	var playerId = Session.get('player_id');
	var gameId = Session.get('game_id');
	var playerName = Session.get('player_name');
	var msgType = 'chat';
	doc = GameStates.findOne({player_id:playerId, game_id:gameId});
	if(mInfo.found == "true") {
		GameStates.update(doc._id, {$inc: {game_score: 100}});
		Games.update(doc.game_id, {$inc: {turn_count: 1}});
		msgType = 'movie';
	}
	Messages.insert({
        player_id: playerId,
        game_id: gameId,
        player_name: playerName,
        movie: movie,
        poster: poster,
        msg_type: msgType,
        timestamp: new Date()
     });
	//console.log(doc);
		
};
