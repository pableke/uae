
const pdf = require("html-pdf"); //html string to pdf format

const options = {
	format: "A4", // allowed units: A3, A4, A5, Legal, Letter, Tabloid
	orientation: "portrait", // portrait or landscape

	// Page options: default is 0, units: mm, cm, in, px
	border: "15mm", //{ "top": "2in", "right": "1in", "bottom": "2in", "left": "1.5in" },
	paginationOffset: 1, // Override the initial pagination number
	header: { height: "40mm" },
	footer: { height: "40mm" },
	// Zooming option, can be used to scale images if `options.type` is not pdf
	zoomFactor: "1", // default is 1

	"phantomPath": "node_modules/phantomjs/bin/phantomjs", // PhantomJS binary que debería descargarse automáticamente
	"phantomArgs": [], // array de strings usados como argumentos de phantomjs, por ejemplo ["–ignore-ssl-errors=yes"]

	// Para correr Node application como Windows service
	"childProcessOptions": { "detached": true },

	// Headers HTTP que se usan para requests
	"httpHeaders": { "Authorization": "Bearer ACEFAD8C-4B4D-4042-AB30-6C735F5BAC8B" }, // por ejemplo
	// Cookies HTTP que se usan para requests
	"httpCookies": [{
		"name": "Valid-Cookie-Name", // obligatorio
		"value": "Valid-Cookie-Value", // obligatorio
		"domain": "localhost",
		"path": "/foo", // obligatorio
		"httponly": true,
		"secure": false,
		"expires": (new Date()).getTime() + (1000 * 60 * 60) // por ejemplo, caduca en 1 hora
	}],

	// File options
	type: "pdf", // allowed file types: png, jpeg, pdf
	quality: "75" // only used for types png & jpeg
}

exports.pdf = function(req, res) {
	//prueba de traduccion de un html a pdf
	var html = res.build("dist/reports/test.html").getValue();
	pdf.create(html).toStream(function(err, stream) {
		if (err) { // handle error and return a error response code
			console.log(err)
			return res.status(500).end();
		}
		res.status(200).contentType("pdf").attachment("test.pdf");
		stream.pipe(res);
	});
}
