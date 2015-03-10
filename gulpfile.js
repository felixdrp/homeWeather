var gulp = require('gulp')
var concat = require('gulp-concat')
var uglify = require('gulp-uglify')
 
gulp.task('js', function () {
    gulp.src(['src/**/module.js', 'src/**/*.js'])
	.pipe(concat('public/lib/app.js'))
//	.pipe(uglify())
	.pipe(gulp.dest('.'))
}) 

gulp.task('watch', ['js'], function () {
    gulp.watch('src/**/*.js', ['js'])
}) 
