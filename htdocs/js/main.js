
	$(".app-info").popover({trigger: "hover"});

	var socket = io.connect('http://173.255.219.158:8888');
	var app;
	var tweets;

	var TweetModel = Backbone.Model.extend({
		read: false,
		class: ""
	});

	var TweetCollection = Backbone.Collection.extend({
		model: TweetModel,
		unread: 0
	});

	tweets = new TweetCollection();

	tweets.on("add", function (e) {
		console.log("add");
		var un = _.filter(this.models, function (tweet) {
			return tweet.read === false;
		});

		this.unread = un.length;
	});

	var TitleView = Backbone.View.extend({
		el: $("title"),
		collection: tweets,
		initialize: function () {
			this.render();
			this.collection.on("add", this.render, this);
			this.collection.on("update", this.render, this);
		},
		render: function () {
			console.log(this.collection);
			if(this.collection.unread === 0) {
				this.$el.text("Realtime Experiment");
			} else {
				this.$el.text("(" + this.collection.unread + ") Realtime Experiment");
			}
		}
	});

	var TweetUpdateView = Backbone.View.extend({
		el: $(".update-container"),
		collection: tweets,
		template: $("#update-template").html(),
		events: {
			"click": "updateCollection"
		},
		initialize: function () {
			this.collection.on("update", function () {
				console.log(this);
				this.$el.hide();
			}, this);

			this.collection.on("add", this.render, this);
		},
		updateCollection: function () {
			this.collection.trigger("update");
		},
		render: function () {
			console.log("update render");
			this.$el.show();
			var tpl = _.template(this.template);
			this.$el.html(tpl({new_tweets: this.collection.unread}));
			return this;
		}
	})

	var TweetListView = Backbone.View.extend({

		el: $(".tweet-collection-container"),

		collection: tweets,

		initialize: function () {
			this.render();
			var self = this;
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

	app = new TweetListView();
	

	socket.on('tweets', function (data) {
		tweets.add(data);
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

	var updateTweets = new TweetUpdateView();
	var title = new TitleView();