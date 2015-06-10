// something old
var gulp = require('gulp'),
  plugins = require('gulp-load-plugins')({lazy: false}),
  del = require('del');
// Configuration
var dist = './build';
var tmp = './tmp';
var coffeeFiles = './app/**/*.coffee';

// CSS
gulp.task('css', function () {
  return gulp.src('./app/styles/bandura.less')
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.less({
      paths: ['./app/styles']
    }))
    .pipe(plugins.autoprefixer('last 2 version'))
    .pipe(plugins.sourcemaps.write('./'))
    .pipe(gulp.dest(dist))
});

// Coffee
gulp.task('coffee', function () {
  return gulp.src(coffeeFiles)
    .pipe(plugins.coffee({bare: true}))
    .pipe(plugins.react())
    .pipe(gulp.dest(tmp));
});

// Coffee Lint
gulp.task('lint', function () {
  gulp.src(coffeeFiles)
    .pipe(plugins.coffeelint())
    .pipe(plugins.coffeelint.reporter())
});

// JS
gulp.task('js', ['lint', 'coffee'], function () {
  return gulp.src(['./tmp/bandura.js','./tmp/fixtures/testpage.js'])
    .pipe(plugins.browserify({
      extensions: ['.js'],
      insertGlobals: true,
      debug: true
    }))
    .pipe(gulp.dest(dist))
});

gulp.task('clean', function (cb) {
  del([dist, tmp], cb);
});

gulp.task('watch', function () {
  gulp.watch('./app/**/*.coffee', ['js']);
  gulp.watch('./app/styles/**/*.less', ['css']);
});

// Build
gulp.task('build', ['js', 'css']);

// Default task
gulp.task('default', ['clean'], function () {
  gulp.start(['build', 'watch'])
});
