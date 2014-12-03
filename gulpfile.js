/**
 * Go and look to buildfile.coffee
 * */

require('coffee-script/register');
require('./buildfile.coffee');



return
// something old
var stylus = require('gulp-stylus'),
    coffee = require('gulp-coffee'),
    jsx = require('gulp-jsx'),
    react = require('gulp-react'),
    plumber = require('gulp-plumber'),
    gulp = require('gulp');

gulp.task('coffee', function () {
    gulp.src('./app/**/*.coffee')
        .pipe(plumber())
        .pipe(coffee({bare: true}))
        .pipe(react())
        .pipe(gulp.dest('./dist'));
});

gulp.task('stylus', function () {
    gulp.src('./app/styles/**/*.stylus')
        .pipe(plumber())
        .pipe(stylus())
        .pipe(gulp.dest('./dist/styles'))
});

gulp.task('watch', function() {
   gulp.watch('./app/**/*.coffee', ['coffee']);
   gulp.watch('./app/styles/**/*.stylus', ['stylus']);
});

gulp.task('default', ['coffee', 'stylus', 'watch']);
