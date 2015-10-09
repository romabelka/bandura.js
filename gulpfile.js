
const gulp = require('gulp');
const del = require('del');
const browserify = require('browserify');
const through2 = require('through2');
const plugins = require('gulp-load-plugins')({ lazy: false });

gulp.task('css', function() {
  return gulp.src('./public/styles/bandura.less')
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.less({
      paths: ['./app/styles'],
    }))
    .pipe(plugins.autoprefixer('last 2 version'))
    .pipe(plugins.sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/styles'));
});

gulp.task('js', function() {
  return gulp.src('./src/**/*.js')
    .pipe(through2.obj(function(file, enc, next) {
      browserify(file.path, { debug: process.env.NODE_ENV === 'development' })
        .transform(require('babelify'))
        .bundle(function(err, res) {
          if (err) { return next(err); }

          file.contents = res;
          next(null, file);
        });
    }))
    .pipe(plugins.concat('bundle.js'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('clean', function(cb) {
  del(['./dist'], cb);
});

gulp.task('watch', function() {
  gulp.watch('./src/**/*.js', ['js']);
  gulp.watch('./public/styles/**/*.less', ['css']);
});

gulp.task('default', ['js', 'css']);
