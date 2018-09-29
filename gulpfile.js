const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const babel = require('gulp-babel');

gulp.task("default",['copy-html','minify-js','styles','copy-sw','copy-manifest'], function() {
  gulp.watch('sass/**/*.scss',['styles']);
  gulp.watch('/*.html',['copy-html']);
  gulp.watch('/sw.js',['copy-sw']);
  //as manifest wouldn't be changed often so i didn't make it to watch
});

gulp.task('dist',['copy-html','styles','minify-js','optimise-images','copy-sw','copy-manifest']);



gulp.task('minify-js', function() {
    return gulp.src(['js/dbhelper.js','js/main.js','js/restaurant_info.js'])
    //.pipe(babel({presets:['es2016']}))
    .pipe(uglify())
    .on("error",function(e) {
      console.log(e);
    })
    .pipe(gulp.dest("dist/dbhelper.js"));
});

gulp.task('optimise-images', function() {
    return gulp.src('img/*')
        .pipe(imagemin({
            progressive: true,
            use: [pngquant()]
        }))
        .pipe(gulp.dest('dist/img'));
});

gulp.task("styles", function() {
    gulp
    .src("sass/**/*.scss")
    .pipe(sass({outputStyle: 'compressed'}))
    .on("error", sass.logError)
    .pipe(
      autoprefixer({
        browsers:['last 3 versions']
      })
    )
    .pipe(gulp.dest("./dist/css"));
});

gulp.task('copy-html',function() {
    gulp.src('./*.html')
    .pipe(gulp.dest('./dist'));
});
gulp.task('copy-manifest',function() {
    gulp.src('./manifest.json')
    .pipe(gulp.dest('./dist'));
});
gulp.task('copy-sw',function() {
    gulp.src('./sw.js')
    .pipe(gulp.dest('./dist'));
});
