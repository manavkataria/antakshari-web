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

Template.ChatAndInfoListView.events({
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