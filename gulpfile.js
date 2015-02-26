// something old
var coffee = require('gulp-coffee'),
    less = require('gulp-less'),
    react = require('gulp-react'),
    plumber = require('gulp-plumber'),
    gulp = require('gulp'),
    browserify = require('gulp-browserify');

gulp.task('less', function () {
    return gulp.src('./app/styles/bandura.less')
        .pipe(plumber())
        .pipe(less())
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
    return gulp.src('./tmp/roma.js')
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
    gulp.watch('./app/styles/**/*.less', ['less']);
});

gulp.task('build', ['browserify', 'less']);
gulp.task('default', ['build', 'watch']);