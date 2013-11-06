var Channels, Messages, Users;

Channels = new Meteor.Collection("channels");

Meteor.publish("channels", function() {
  return Channels.find();
});

Users = new Meteor.Collection("users");

Meteor.publish("users", function(channel_id) {
  return Users.find({
    channel_id: channel_id
  });
});

Messages = new Meteor.Collection("messages");

Meteor.publish("messages", function(channel_id) {
  return Messages.find({
    channel_id: channel_id
  });
});

Meteor.startup(function() {
  var channel, data, i, len, results;
  if (Channels.find().count() == 0) {
    data = ["Meteor", "Javascript", "Objective-C"];
    results = [];
    for (i = 0, len = data.length; i < len; i++) {
      channel = data[i];
      results.push(Channels.insert({
        name: channel
      }));
    }
    return results;
  }
  
  if (Users.find().count() != 0) {
	Users.remove({});
  }
  
  if (Messages.find().count() != 0) {
	  Messages.remove({});
  }
});

