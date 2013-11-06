var Channels, Messages, Users;

Channels = new Meteor.Collection("channels");

Users = new Meteor.Collection("users");

Messages = new Meteor.Collection("messages");

Session.set('channel_id', null);

Session.set('user_id', null);

Session.set('user_name', null);

Meteor.startup(function() {
  setMovieSearchCallback(onMovieSearchDone);
  var user, username;
  if (!Session.get('user_id')) {
    //username = prompt("Please enter a username");
    //if (!username) {
      username = "Guest" + (Math.floor(Math.random() * 1000));
      Session.set('user_name', username);
    //}
    user = Users.insert({
      name: username
    });
    return Session.set('user_id', user);
  }
});

Meteor.subscribe('channels', function() {
  var channel;
  if (!Session.get('channel_id')) {
    channel = Channels.findOne({}, {
      sort: {
        name: 1
      }
    });
    return Session.set('channel_id', channel._id);
  }
});

Meteor.autosubscribe(function() {
  var channel_id, user_id;
  channel_id = Session.get('channel_id');
  user_id = Session.get('user_id');
  if (user_id && channel_id) {
    Users.update(user_id, {
      $set: {
        channel_id: channel_id,
        score: 0
      }
    });
    Meteor.subscribe('users', channel_id);
    return Meteor.subscribe('messages', channel_id);
  }
});

Template.channels.channels = function() {
  return Channels.find({}, {
    sort: {
      name: 1
    }
  });
};

Template.channels.state = function() {
  if (Session.equals('channel_id', this._id)) {
    return 'disabled';
  } else {
    return '';
  }
};

Template.channels.events = {
  'click .channelBtn': function(event) {
    return Session.set('channel_id', this._id);
  },
  
  'click #addChannel': function() {
		console.log("add channel");
  }
};

Template.input.events = {
  'keyup': function(event) {
    var $inputForm, $messageDialog;
    if (event.which === 13) {
      $inputForm = $('#footer input');
      $messageDialog = $('#messages');
      if ($inputForm.val()) {
    	getMovieSearchResult($inputForm.val());
      }
      $inputForm.val("");
      $inputForm.focus();
      return $messageDialog.scrollTop(9999999);
    }
  }
};

Template.users.users = function() {
  var channel_id, sel;
  channel_id = Session.get('channel_id');
  if (!channel_id) {
    ({});
  }
  sel = {
    channel_id: channel_id
  };
  return Users.find(sel, {
    sort: {
      name: 1,
      score: 1,
    }
  });
};

Template.messages.messages = function() {
  var channel_id, sel;
  channel_id = Session.get('channel_id');
  if (!channel_id) {
    ({});
  }
  sel = {
    channel_id: channel_id
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
	var user_id = Session.get('user_id');
	var channel_id = Session.get('channel_id');
	var user_name = Session.get('user_name');
	Messages.insert({
        user_id: user_id,
        channel_id: channel_id,
        user_name: user_name,
        movie: movie,
        poster: poster,
        timestamp: new Date()
     });
	//var docid = Users.findOne({'name': user_name, 'channel_id': channel_id});
	//console.log(docid);
	//Users.update({_id:docid._id}, {$inc: {score: 100}});
	if(mInfo.found == "true")
		Users.update(user_id, {$inc: {score: 100}});
};
