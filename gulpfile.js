// something old
var stylus = require('gulp-stylus'),
    coffee = require('gulp-coffee'),
    react = require('gulp-react'),
    plumber = require('gulp-plumber'),
    gulp = require('gulp'),
    browserify = require('gulp-browserify');

gulp.task('stylus', function () {
    return gulp.src('./app/styles/bandura.stylus')
        .pipe(plumber())
        .pipe(stylus())
        .pipe(gulp.dest('./build'))
});

gulp.task('coffee', function () {
    return gulp.src('./app/**/*.coffee')
        .pipe(plumber())
        .pipe(coffee({bare: true}))
        .pipe(react())
        .pipe(gulp.dest('./tmp'));
});

gulp.task('browserify', ['coffee'], function() {
    return gulp.src(['./tmp/roma.js', './tmp/murad.js'])
        .pipe(plumber())
        .pipe(browserify({
                extensions: ['.js'],
                insertGlobals: true,
                debug: true
            }))
    .pipe(gulp.dest('./build'))
});

gulp.task('watch', function() {
    gulp.watch('./app/**/*.coffee', ['browserify']);
    gulp.watch('./app/styles/**/*.stylus', ['stylus']);
});

gulp.task('build', ['browserify', 'stylus']);
gulp.task('default', ['build', 'watch']);