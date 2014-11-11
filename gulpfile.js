var stylus  = require('gulp-stylus'),
    coffee  = require('gulp-coffee'),
    jsx     = require('gulp-jsx'),
    plumber = require('gulp-plumber'),
    gulp    = require('gulp');

gulp.task('coffee', function() {
    gulp.src('./app/logic/*.coffee')
        .pipe(plumber())
        .pipe(coffee())
        .pipe(gulp.dest('./dist/logic'));
});

gulp.task('stylus', function () {
   gulp.src('./app/styles/**/*.stylus')
       .pipe(plumber())
       .pipe(stylus())
       .pipe(gulp.dest('./dist/styles'))
});

gulp.task('watch', function() {
   gulp.watch('./app/**/*.coffee', ['coffee', 'stylus']);
});

gulp.task('default', ['coffee', 'stylus','watch']);
