gulp = require('gulp')
#coffee = require('gulp-coffee')
#react = require('gulp-react')
browserify = require('gulp-browserify')
coffeereactify = require('coffee-reactify')
#plumber = require('gulp-plumber')


gulp.task 'script', ->
  gulp.src ['./app/**/*.coffee'], { read: false }
  .pipe coffee({bare: true})
  .pipe react()
  .pipe gulp.dest('./tmp')

gulp.task 'build', ->
  gulp.src('./tmp/init.js')
  .pipe(browserify(
      insertGlobals: true,
      debug: true
  ))
  .pipe(gulp.dest('./build/js'))



gulp.task 'default', ['script']