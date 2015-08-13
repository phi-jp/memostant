/*
 * gulpfile.js
 */

var gulp = require('gulp');
var riot = require('gulp-riot');
var concat = require('gulp-concat');
var server = require('gulp-express');

var target = ['./tags/*.jade', './tags/**/*.jade'];
var output = 'public/scripts';

gulp.task('riot', function() {
  gulp
    .src(target)
    .pipe(riot({template:'jade'}))
    // .pipe(gulp.dest(output))
    .pipe(concat('tags.js'))
    .pipe(gulp.dest(output))
    ;
});

gulp.task('watch', function(){
  gulp.watch(target, ['riot']);
});

gulp.task('server', function() {
  server.run(['app.js']);
});

gulp.task('default', ['watch', 'server']);
