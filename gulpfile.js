
//npm install --global gulp-cli
//npm install -D gulp gulp-concat gulp-minify gulp-clean-css
const gulp = require("gulp");
const minify = require("gulp-minify");
const concat = require("gulp-concat");
const css = require("gulp-clean-css");

// Settings
const DIST_DIR = "src/public/dist";
const CSS_FILES = [ "src/public/css/style.css" ];
const CSS_SINGLES = [ "src/public/css/print.css" ];
const JS_FILES = [ "src/public/js/multi-box.js", "src/public/js/util.js" ];
const JS_SINGLES = [ "src/public/js/service-worker.js", "src/public/js/worker.js" ];
const JS_MINIFY_CONFIG = { ext: { min: ".min.js" }, ignoreFiles: [".min.js"]};

// Tasks
gulp.task("pack-css", () => {    
	return gulp.src(CSS_FILES).pipe(css()).pipe(gulp.dest(DIST_DIR));
});
gulp.task("single-css", () => {    
	return gulp.src(CSS_SINGLES).pipe(css()).pipe(gulp.dest(DIST_DIR));
});

gulp.task("pack-js", () => {
	return gulp.src(JS_FILES).pipe(concat("multi-box.js")).pipe(minify(JS_MINIFY_CONFIG)).pipe(gulp.dest(DIST_DIR));
});
gulp.task("single-js", () => {
	return gulp.src(JS_SINGLES).pipe(minify(JS_MINIFY_CONFIG)).pipe(gulp.dest(DIST_DIR));
});

gulp.task("watch", () => {
	gulp.watch(CSS_FILES, gulp.series("pack-css")); 
	gulp.watch(CSS_SINGLES, gulp.series("single-css")); 
	gulp.watch(JS_FILES, gulp.series("pack-js")); 
	gulp.watch(JS_SINGLES, gulp.series("single-js")); 
	// Other watchers ...
});

gulp.task("default", gulp.parallel("pack-css", "single-css", "pack-js", "single-js", "watch"));
