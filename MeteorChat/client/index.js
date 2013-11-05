Template.LoginView.events({
	"click #fbBtn": function(e, tmpl){
		Meteor.loginWithFacebook({
				//requestPermissions: ['publish_actions']
		}, function (err) {
			if(err) {
				console.log(err);
			} else {
				//show an alert
				//alert('logged in');
				//Init();
				console.log(Meteor.user());
				$("#nameRow").hide();
				$("#roomsRow").show();
							
				status("info", "Connecting...");
				_warpclient.connect(Meteor.user().services.facebook.username);
			}
		});
	}
});

Template.LoginView.events({
	"click #nameBtn": function(e, tmpl){
		if ($("#nameText").val() != "")
		{
			nameId = $("#nameText").val();
			
			$("#nameRow").hide();
			$("#roomsRow").show();
						
			status("info", "Connecting...");
			_warpclient.connect(nameId);
		}
	}
});

Template.LoginLogoutView.events({
	"click #lgtBtn": function(e, tmpl){
		Meteor.logout(function(err) {
			if(err) {
				//show err message
				console.log(err);
			} else {
				//show alert that says logged out
				console.log('logged out');
				$("#nameRow").show();
				$("#roomsRow").hide();
				_warpclient.disconnect();
			}
		});
	}
	
});

Template.UserView.profilePic = function() {
	if(Meteor.user()!= null)
	  return 'http://graph.facebook.com/' + Meteor.user().services.facebook.id + '/picture?width=32';
};

Template.UserView.userName = function() {
	if(Meteor.user()!= null)
	  return Meteor.user().services.facebook.name;
};
