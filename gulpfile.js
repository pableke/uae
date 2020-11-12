
//npm remove merge-stream gulp gulp-concat gulp-minify gulp-clean-css gulp-htmlmin gulp-strip-comments
//npm install -D merge-stream gulp gulp-concat gulp-minify gulp-clean-css gulp-htmlmin gulp-strip-comments
const fs = require("fs"); //file system
const path = require("path"); //file and directory paths
const merge = require("merge-stream");
const gulp = require("gulp");
const htmlmin = require("gulp-htmlmin");
const jsmin = require("gulp-minify");
const concat = require("gulp-concat");
const cleanCSS = require("gulp-clean-css");
const strip = require("gulp-strip-comments");

// Settings
const HTML_PATH = "src/views/**/*.html";
const CSS_FILES = [ "src/scripts/css/style.css", "src/scripts/css/print.css" ];
const JS_FILES = [ "src/scripts/js/multi-box.js", "src/scripts/js/util.js" ];
const JS_SINGLES = [ "src/scripts/js/service-worker.js", "src/scripts/js/worker.js" ];

// Task to minify HTML's
gulp.task("minify-html", () => {
	const config = { collapseWhitespace: true, removeComments: false }; //removeComments => remove CDATA
	return gulp.src(HTML_PATH).pipe(strip()).pipe(htmlmin(config)).pipe(gulp.dest("src/tpl"));
});

// Tasks to minify CSS's
gulp.task("minify-css", () => {
	const config = {level: {1: {specialComments: 0}}};
	return gulp.src(CSS_FILES).pipe(cleanCSS(config)).pipe(gulp.dest("src/public/css"));
});

// Tasks to minify JS's
gulp.task("minify-js", () => {
	const dest = "src/public/js";
	const config = { ext: { min: ".min.js" }, ignoreFiles: [".min.js"]};

	let pack = gulp.src(JS_FILES).pipe(concat("multi-box.js")).pipe(jsmin(config)).pipe(gulp.dest(dest));
	let oneByOne = gulp.src(JS_SINGLES).pipe(jsmin(config)).pipe(gulp.dest(dest));
	return merge(pack, oneByOne);
});

gulp.task("watch", () => {
	gulp.watch(HTML_PATH, gulp.series("minify-html")); 
	gulp.watch(CSS_FILES, gulp.series("minify-css")); 
	gulp.watch(JS_FILES, gulp.series("minify-js")); 
	gulp.watch(JS_SINGLES, gulp.series("minify-js")); 
	// Other watchers ...
});

gulp.task("default", gulp.parallel("minify-html", "minify-css", "minify-js", "watch"));
