var gulp = require('gulp')
var concat = require('gulp-concat')
var uglify = require('gulp-uglify')
 
gulp.task('js', function () {
    gulp.src(['src/**/module.js', 'src/**/*.js'])
	.pipe(concat('app.js'))
//	.pipe(uglify())
	.pipe(gulp.dest('.'))

    gulp.src(['app.js'])
	.pipe(gulp.dest('/home/sephir/Documents/felix/kindergarten/nodejs/fileUpload/public/lib'))
}) 

gulp.task('watch', ['js'], function () {
    gulp.watch('src/**/*.js', ['js'])
}) 
//    gulp.watch('src/*.js', ['js'])
