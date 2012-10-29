
	$(".app-info").popover({trigger: "hover"});

	var socket = io.connect('http://173.255.219.158:8888');
	var app;
	var tweets;

	var Tweet = Backbone.Model.extend({});

	var Tweets = Backbone.Collection.extend({
		model: Tweet,
		unread: 0
	})

	tweets = new Tweets();

	var TweetListView = Backbone.View.extend({
		el: $(".tweet-collection-container"),
		collection: tweets,
		initialize: function () {
			this.render();
			var self = this;
			this.collection.on("add", function () {
				self.render();
			});

			this.collection.on("add", this.render(this));
			console.log("initialize");
			//this.render();
		},
		render: function () {
			console.log("render");
			this.$el.empty();
			_.each(this.collection.models, function (tweet) {
				this.renderTweet(tweet);
			}, this);
		},
		renderTweet: function (tweet) {
			console.log("renderTweet");
			var tweetView = new TweetView({model: tweet});
			this.$el.prepend(tweetView.render().el);
		}
	});

	app = new TweetListView();
	

	socket.on('tweets', function (data) {
		console.log(data);
		tweets.add(data);
	});

	


	var TweetView = Backbone.View.extend({
		template: $("#tweet-template").html(),

		render: function () {
			var tpl = _.template(this.template);
			this.$el.html(tpl(this.model.toJSON()));
			return this;
		}
	});