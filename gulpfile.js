/**
 * Go and look to buildfile.coffee
 * */

require('coffee-script/register');
//require('./buildfile.coffee');


// something old
var stylus = require('gulp-stylus'),
    coffee = require('gulp-coffee'),
    jsx = require('gulp-jsx'),
    react = require('gulp-react'),
    plumber = require('gulp-plumber'),
    gulp = require('gulp'),
    browserify = require('gulp-browserify');

gulp.task('coffee', function () {
    gulp.src('./app/**/*.coffee')
        .pipe(plumber())
        .pipe(coffee({bare: true}))
        .pipe(react())
        .pipe(gulp.dest('./tmp'));
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

gulp.task('browserify_react', function() {
    gulp.src('./tmp/init.js')
        .pipe(browserify({
                extensions: ['.js'],
                insertGlobals: true,
                debug: true
            }
    ))
    .pipe(gulp.dest('./build'))
});

gulp.task('browserify_bandura', function() {
    gulp.src('./tmp/api/initBandura.js')
        .pipe(browserify({
                extensions: ['.js'],
                insertGlobals: true,
                debug: true
            }
    ))
    .pipe(gulp.dest('./build'))
});

gulp.task('build', ['coffee', 'browserify_react', 'browserify_bandura']);

gulp.task('default', ['coffee', 'browserify','watch']);
