
exports.error404 = function(req, res) {
	res.set("tplSection", "src/tpl/errors/err404.html").render();
};

exports.error413 = function(req, res) {
	res.set("tplSection", "src/tpl/errors/err413.html")
		.msgError("Error 413: Request entity too large").render();
};
