var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
// var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var preprocess = require('gulp-preprocess');
var del = require('del');

// Browserify task
gulp.task('browserify', function () {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: './app/js/vic.js',
    debug: true
  });

  return b.bundle()
    .pipe(source('vic-bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: false}))
        // Add transformation tasks to the pipeline here.
        // Uncomment this line to minify
        // .pipe(uglify())
        .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./build/js/'));
});

//Our tasks to build snake
gulp.task('vic-app', function() {
  return gulp.src('./app/app.js')
    .pipe(preprocess({context: { MODULE: 'vic', NODE_ENV: 'development'}}))
    .pipe(gulp.dest('build'));
});

gulp.task('vic-views', function() {
  return gulp.src('./app/views/**/*.ejs')
    .pipe(preprocess({context: { MODULE: 'vic'}}))
    .pipe(gulp.dest('./build/views/'));
});

gulp.task('vic-js', function() {
  return gulp.src('./app/js/*.js')
    .pipe(preprocess({context: { MODULE: 'vic'}}))
    .pipe(gulp.dest('./build/js/'));
});

gulp.task('vic-server-js', function() {
  return gulp.src('./app/js/server/*.js')
    .pipe(preprocess({context: { MODULE: 'vic'}}))
    .pipe(gulp.dest('./build/js/server/'));
});

gulp.task('vic-lib-js', function() {
  return gulp.src('./app/js/lib/*.js')
    .pipe(preprocess({context: { MODULE: 'vic'}}))
    .pipe(gulp.dest('./build/js/lib'));
});

gulp.task('vic-images', function() {
  return gulp.src('./app/images/*')
    .pipe(gulp.dest('./build/images'));
});

gulp.task('vic-clean', ['vic-js'], function() {
return del([
    // Delete unnecessary files after build
    // './build/js/globby.js'
  ]);
});

gulp.task('build', ['vic-app', 'vic-views', 'vic-lib-js', 'vic-js', 'vic-server-js', 'vic-images']);

gulp.task('watch', function() {
  // Main app file
  gulp.watch('./app/app.js', ['vic-app']);

  // EJS views
  gulp.watch('./app/views/**/*.ejs', ['vic-views']);

  //CSS and JS files
  // gulp.watch('./app/css/*', ['oneline-css', 'snake-css']);
  gulp.watch('./app/js/vic.js', ['vic-js', 'vic-clean']); 
});