// Init bootstrap popovers
$(".app-info").popover({trigger: "hover"});

// From socket.io
var socket = io.connect('http://173.255.219.158:8888');

// Backbone
var TweetModel = Backbone.Model.extend({
	read: false
});

var TweetCollection = Backbone.Collection.extend({
	model: TweetModel,
	// Used to store # of tweets recieved from the server that haven't yet been displayed
	unread: 0 
});

var TweetView = Backbone.View.extend({
	template: $("#tweet-template").html(),
	tagName: "li",
	className: "old",

	render: function () {
		var tpl = _.template(this.template);
		this.$el.attr("class", this.model.get("class"));
		this.$el.html(tpl(this.model.toJSON()));
		return this;
	}
});

// <title> tag
var TitleView = Backbone.View.extend({
	el: $("title"),
	initialize: function () {
		this.collection = this.options.collection;
		this.render();
		this.collection.on("new", this.render, this); // Displays # of new tweets
		this.collection.on("update", this.render, this); // Resets
	},
	render: function () {
		if(this.collection.unread === 0) {
			this.$el.text("Realtime Experiment");
		} else {
			this.$el.text("(" + this.collection.unread + ") Realtime Experiment");
		}
	}
});

// Click to view X new tweets
var TweetUpdateView = Backbone.View.extend({
	el: $(".update-container"),
	template: $("#update-template").html(),
	events: {
		"click": "updateCollection"
	},
	initialize: function () {
		this.collection = this.options.collection;

		this.collection.on("update", function () {
			this.$el.hide();
		}, this);

		this.collection.on("new", this.render, this);
	},
	updateCollection: function () {
		this.collection.trigger("update");
	},
	render: function () {
		this.$el.show();
		var tpl = _.template(this.template);
		this.$el.html(tpl({new_tweets: this.collection.unread}));
		return this;
	}
})

var TweetListView = Backbone.View.extend({

	el: $(".tweet-collection-container"),

	initialize: function () {
		this.collection = this.options.collection;
		this.render();
		this.collection.on("update", this.render, this);
	},

	render: function () {
		this.$el.empty();
		_.each(this.collection.models, function (tweet) {
			this.renderTweet(tweet);
		}, this);
	},

	renderTweet: function (tweet) {
		var tweetView = new TweetView({model: tweet});
		if (!tweet.read) {
			tweet.set("class", "new");
		} else {
			tweet.set("class", "old")
		}
		tweet.read = true;
		this.$el.prepend(tweetView.render().el);
		this.collection.unread = 0;
	}
});

var tweets = new TweetCollection();
var tweetList = new TweetListView({collection: tweets});
var updateTweets = new TweetUpdateView({collection: tweets});
var title = new TitleView({collection: tweets});

// When new tweets are added, we want to increase the unread count
// but not automatically render the list view
tweets.on("add", function (e) {
	var un = _.filter(this.models, function (tweet) {
		return tweet.read === false;
	});

	this.unread = un.length;

	// Trigger "new" separate from "add" so we can do the unread math first
	this.trigger("new");
});


socket.on('tweets:stream', function (data) {
	tweets.add(data);
});

// Seeds tweets when page first loads
// Don't count as unread so we skip the add / new events
socket.on('tweets:search', function (data) {
	tweets.reset(data);
	tweets.trigger("update");
});