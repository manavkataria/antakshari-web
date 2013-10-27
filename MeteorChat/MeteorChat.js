Messages = new Meteor.Collection('messages');

if (Meteor.isClient) {

////////// Helpers for in-place editing //////////
// Returns an event map that handles the "escape" and "return" keys and
// "blur" events on a text input (given by selector) and interprets them
// as "ok" or "cancel".
var okCancelEvents = function (selector, callbacks) {
  var ok = callbacks.ok || function () {};
  var cancel = callbacks.cancel || function () {};

  var events = {};
  events['keyup '+selector+', keydown '+selector+', focusout '+selector] =
    function (evt) {

      if (evt.type === "keydown" && evt.which === 27) {
        // escape = cancel
        cancel.call(this, evt);

      } else if (evt.type === "keyup" && evt.which === 13) {
        // blur/return/enter = ok/submit if non-empty

        var value = String(evt.target.value || "");
        if (value)
          ok.call(this, value, evt);
        else
          cancel.call(this, evt);
      }
    };

  return events;
  };

  // Attach events to keydown, keyup, and blur on messageBox input box.
  Template.entry.events(okCancelEvents('#messageBox', {
    ok: function (msg, event) {
      var username = document.getElementById('username');
      var timestamp = Date.now() / 1000;

      if (username.value == "") {
        alert("Please enter a username");
        return;
      }

      console.log(username.value + " entered \"" + msg + "\"");

      Messages.insert({username: username.value, message: msg, time: timestamp});
      event.target.value = "";
    }
  }));

  Template.messages.messages = function () {
    return Messages.find({}, {sort: {time: -1} });
  };

  /* Template.entry.events({
    'click input' : function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log("You pressed the button");
    }
  }); */
}
