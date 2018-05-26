var gulp           = require('gulp'),
    sass           = require('gulp-sass'),
    pug            = require('gulp-pug'),
    csso           = require('gulp-csso'),
    notify         = require('gulp-notify'),
    sourcemaps     = require('gulp-sourcemaps'),
    autoprefixer   = require('gulp-autoprefixer'),
    browserSync    = require('browser-sync').create(),
    normalize      = require('node-normalize-scss'),
    rename         = require('gulp-rename'),
    uglify         = require('gulp-uglify'),
    del            = require('del'),
    webpack        = require('webpack'),
    webpackStream  = require('webpack-stream'),
    webpackConfig = require('./webpack.config.js');


var paths = {
    root: './build',
    templates: {
        pages: 'src/templates/pages/*.pug',
        src: 'src/templates/**/*.pug'
    },
    styles: {
        src: 'src/styles/**/*.scss',
        dest: 'build/assets/styles/'
    },    
    images: {
        src: 'src/images/**/*.*',
        dest: 'build/assets/images/'
    },
    scripts: {
        src: 'src/scripts/**/*.js',
        dest: 'build/assets/scripts/'
    }
}

function templates() {
    return gulp.src(paths.templates.pages)
        .pipe(pug({ pretty: true }))
        .pipe(gulp.dest(paths.root));
}

function styles() {
    return gulp.src('./src/styles/app.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({ includePaths: normalize.includePaths }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .on("error", notify.onError({
            message: "Error: <%= error.message %>",
            title: "Error running something"
          }))
        .pipe(csso())
        .pipe(sourcemaps.write())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(paths.styles.dest))
}

function clean() {
    return del(paths.root);
}

function scripts() {
    return gulp.src('src/scripts/app.js')
        .pipe(webpackStream(webpackConfig, webpack))
        .pipe(gulp.dest(paths.scripts.dest));
}

function images() {
    return gulp.src(paths.images.src)
        .pipe(gulp.dest(paths.images.dest));
}

function server() {
    browserSync.init({
        server: paths.root
    });
    browserSync.watch(paths.root + '/**/*.*', browserSync.reload);
}

function watch() {
    gulp.watch(paths.styles.src, styles);
    gulp.watch(paths.templates.src, templates);
    gulp.watch(paths.images.src, images);
    gulp.watch(paths.scripts.src, scripts);
}

exports.templates = templates;
exports.styles = styles;
exports.clean = clean;
exports.images = images;

gulp.task('default', gulp.series(
    clean,
    gulp.parallel(styles, templates, images, scripts),
    gulp.parallel(watch, server)
));
