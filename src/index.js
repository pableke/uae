
/**
 * @file index.js start http server
 * @author Pablo Rosique Vidal
 * @see <a href="https://github.com/pableke/uae">UAE</a>
 */

//required node modeules
const fs = require("fs"); //file system
const url = require("url"); //url parser
const http = require("http"); //http server
const https = require("https"); //secure server
const qs = require("querystring"); //parse post data
const env = require("dotenv").config(); //load env const
const formidable = require("formidable"); //multipart forms
const valid = require("validate-box"); //validators
const session = require("mysession"); //validators
const trees = require("tree-ss"); //js server tree
const router = require("./lib/router"); //router
const dao = require("./dao/Factory"); //bd factory

// Settings
const i18n = { //aviable languages list
	"es": require("./i18n/es.js"), 
	"en": require("./i18n/en.js")
};

// Openssl Certificates
const privateKey = fs.readFileSync(__dirname + "/certs/key.pem").toString();
const certificate = fs.readFileSync(__dirname + "/certs/cert.pem").toString();
const options = { key: privateKey, cert: certificate };

const optsForm = {
	uploadDir: __dirname + "/../dist/public/upload",
	keepExtensions: true,
	maxFieldsSize: 20 * 1024 * 1024, //20mb
	maxFileSize: 200 * 1024 * 1024, //200mb
	maxFields: 1000,
	multiples: true
};

dao.open(); //init dao factory
session.open(); //default options
trees.start({ templateIndex: __dirname + "/../dist/index.html" }); //template index

// Routes
const error = require("./routes/error"); //error routes
const index = require("./routes/index"); //index routes
const producto = require("./routes/producto"); //usuario producto
const test = require("./routes/test"); //test routes
const usuario = require("./routes/usuario"); //usuario routes
const wp = require("./routes/webpush"); //web-push routes

//create server instance
function fnRequest(req, res) {
	//set cookie and enable Cross Origin Resource Sharing (CORS)
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
	res.setHeader("Access-Control-Request-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	res.setHeader("Access-Control-Request-Method", "*");
	res.setHeader("Access-Control-Allow-Credentials", true);

	let parts = url.parse(req.url.toLowerCase(), true); //parse url
	let pathname = parts.pathname; //https://example.org/abc/xyz?123 = /abc/xyz
	//Static request => res.end()
	if (pathname.indexOf("/favicon.ico") > -1)
		return res.end(); //ignore icon request
	if (pathname.indexOf("/public/") > -1)
		return trees.init(req, res).file(pathname.substr(1)); //serve static file

	//configure request
	session.init(req, res); //init reques with session
	req.remoteAddress = req.connection.remoteAddress || req.socket.remoteAddress; //IP client
	req.isAjax = (req.headers["x-requested-with"] == "XMLHttpRequest"); //ajax?
	req.params = parts.query;

	//configure response
	trees.init(req, res).flushMsgs(); //init request, response
	res.lang = function(req, res) {
		let lang = req.params.lang || this.data.lang;
		if (lang && (lang == this.data.lang)) return this;
		//here user has changed current language
		let ac = req.headers["accept-language"] || "es"; //default laguage = es
		lang = (i18n[lang]) ? lang : ac.substr(0, 5); //search region language es-ES
		lang = (i18n[lang]) ? lang : lang.substr(0, 2); //search type language es
		lang = (i18n[lang]) ? lang : "es"; //default language = es
		this.set("lang", lang).add(i18n[lang]).nvl("startSession", ""); //add lang values
		valid.setI18n(lang).setMessages(i18n[lang]); //init date and numbers format
		return this;
	}
	//calc default lang
	res.lang(req, res);

	let i = pathname.lastIndexOf("."); //last dot in url pathname
	let fn = router.route(req, (i > 0) ? pathname.substr(0, i) : pathname); //remove extension
	if (!fn)
		error.error404(req, res); //manage 404 error
	else if (req.method == "POST") { //post request
		if (req.headers["content-type"] == "multipart/form-data") { //multipart => files
			const form = formidable(optsForm);
			form.parse(req, (err, fields, files) => {
				console.log(err, fields, files);
				req.body = fields;
				fn(req, res); //call handler
			});
		}
		else { //simple post request
			let rawData = ""; //buffer
			req.on("data", function(chunk) {
				rawData += chunk;
				if (rawData.length > optsForm.maxFieldsSize) { //20mb
					//delete rawData; //free body memory
					req.connection.destroy(); //FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
					error.error413(req, res); //error request too large
				}
			});
			req.on("end", function() {
				req.body = (req.headers["content-type"] == "application/json") ? JSON.parse(rawData) : qs.parse(rawData);
				fn(req, res); //call handler
			});
		}
	}
	else { //get request
		/*dao.mysql.menus.findPublic().then(menus => {
			fn(req, res.ifFalse("menus", menus)); //load menus and call handler
		});*/
		fn(req, res.nvl("menus", dao.myjson.menus.findPublic())); //load menus and call handler
	}
}
const server = http.createServer(fnRequest);
const secsrv = https.createServer(options, fnRequest);

//capture Node.js Signals and Events
function fnExit(signal) { //exit handler
	console.log("\n--------------------");
	console.log("> Received [" + signal + "].");
	console.log("--------------------");

	dao.close();
	session.close();
	server.close();
	secsrv.close();

	console.log("> Http server closed.");
	console.log("> " + (new Date()));
	console.log("--------------------\n");
	process.exit(0);
};
server.on("close", fnExit); //close server event
secsrv.on("close", fnExit); //close server event
//process.on("exit", function() { fnExit("exit"); }); //common exit signal = SIGINT
process.on("SIGHUP", function() { fnExit("SIGHUP"); }); //generated on Windows when the console window is closed
process.on("SIGINT", function() { fnExit("SIGINT"); }); //Press Ctrl-C / Ctrl-D keys to exit
process.on("SIGTERM", function() { fnExit("SIGTERM"); }); //kill the server using command kill [PID_number] or killall node
process.stdin.on("data", function(data) { (data == "exit\n") && fnExit("exit"); }); //console exit

//start http and https server
let port = process.env.port || 3000;
server.listen(port, "localhost");
secsrv.listen(443, "localhost");

console.log("> Server running at http://localhost:" + port + "/");
console.log("> Server running at https://localhost:443/");
console.log("> " + (new Date()));
