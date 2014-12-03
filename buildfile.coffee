gulp = require('gulp')
#coffee = require('gulp-coffee')
#react = require('gulp-react')
browserify = require('gulp-browserify')
coffeereactify = require('coffee-reactify')
#plumber = require('gulp-plumber')

gulp.task 'script', ->
  gulp.src ['./app/**/*.coffee'], { read: false }
#  .pipe coffee({bare: true})
#  .pipe react()
#  .pipe plumber()
  .pipe browserify({
    debug: true
    transform: ['coffee-reactify']
    extensions: ['.coffee']
    shim: {
      # todo: use shim from https://github.com/deepak1556/gulp-browserify#browserify-shim
    }
  })
  .pipe gulp.dest('./dist')

gulp.task 'default', ['script']