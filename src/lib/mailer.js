
const nodemailer = require("nodemailer");

const AUTH = {
	"client_id": process.env.GOOGLE_CLI_ID,
	"project_id": "node-mailer-293717",
	"auth_uri": process.env.GOOGLE_AUTH_URI,
	"token_uri": process.env.GOOGLE_TOKEN_URI,
	"auth_provider_x509_cert_url": process.env.GOOGLE_CERT_URL,
	"client_secret": process.env.GOOGLE_SECRET
};

// create reusable transporter object using the default SMTP transport
// allow non secure apps to access gmail: https://myaccount.google.com/lesssecureapps
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.GOOGLE_MAIL_USER,
		pass: process.env.GOOGLE_MAIL_PASS
	}
	/*auth: AUTH*/
});

// verify connection configuration
transporter.verify(function(err, success) {
	if (err)
		console.log(err);
	else
		console.log("> Mail server is ready to take our messages");
});

const MESSAGE = {
	from: "info@gmail.com", // sender address
	//to: "pablo.rosique@upct.es", // list of receivers
	//subject: "Email de prueba", // Subject line
	text: "Email submitted by XXXX"//, // plain text body
	//html: res.build("src/tpl/mails/index.html").getValue(), // html
	/*attachments: [ // array of attachment objects
		{ filename: "text1.txt", content: "hello world!" }, // utf-8 string as an attachment
		{ filename: "test.zip", content: fs.createReadStream("src/public/temp/test.zip") }, //stream as an attachment
		{ filename: "license.txt", path: "https://raw.github.com/nodemailer/nodemailer/master/LICENSE" }, // use URL as an attachment
		{ filename: "text2.txt", content: "aGVsbG8gd29ybGQh", encoding: "base64" } // encoded string as an attachment
	]*/
};

exports.send = function(to, subject, html, attachments) {
	MESSAGE.to = to;
	MESSAGE.subject = subject;
	MESSAGE.html = html;
	MESSAGE.attachments = attachments;

	return new Promise(function(resolve, reject) {
		transporter.sendMail(MESSAGE, function(err, info) {
			if (err) {
				console.log("\n--------------------", "Nodemailer", "--------------------");
				console.log("> " + (new Date()));
				console.log("--------------------", "Error", "--------------------");
				//err.message = "Error " + err.errno + ": " + err.sqlMessage;
				console.log(err);
				return reject(err);
			}
			return resolve(info);
		});
	});
}
