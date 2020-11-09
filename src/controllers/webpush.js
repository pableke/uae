
const webpush = require("web-push");
const { VAPID_PUBLIC, VAPID_PRIVATE } = process.env;

webpush.setVapidDetails("mailto:example@yourdomain.org", VAPID_PUBLIC, VAPID_PRIVATE);
let wpSubscripton;

function fnWebPushView(req, res) {
	res.set("tplSection", "src/tpl/forms/web-push.html")
		.set("steps", [{ pref: "webpush.html", text: "Web-Push" }])
		.render();
}

exports.webpush = function(req, res) {
	fnWebPushView(req, res);
}

exports.subscription = function(req, res) {
	// Check the request body has at least an endpoint.
	if (req.body && req.body.endpoint) {
		wpSubscripton = req.body;
		res.text("Valid subscription!");
	}
	else
		res.error("Not a valid subscription.");
}

exports.newMessage = async (req, res) => {
	const data = {
		title: "My Custom Notification", 
		message: req.body.message
	};

	webpush.sendNotification(wpSubscripton, JSON.stringify(data))
		.then(() => res.text(data.title + ": " + req.body.message))
		.catch(err => res.error("" + err));
}
