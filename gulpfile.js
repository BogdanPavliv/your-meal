const {src, dest, watch, parallel, series} = require('gulp');

const scss        = require('gulp-sass')(require('sass'));
const concat      = require('gulp-concat');
const uglify      = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');
const svgSprite = require('gulp-svg-sprite');
const include = require('gulp-include');
const babel = require('gulp-babel');

function pages() {
    return src('app/pages/*.html')
       .pipe(include({
           includePaths: 'app/components'
       }))
       .pipe(dest('app'))
       .pipe(browserSync.stream())
}

function fonts() {
    return src('app/fonts/src/*.*')
        .pipe(dest('app/fonts'))
}

function images() {
    return src(['app/images/src/**/*', '!app/images/src/*.svg'])
        .pipe(newer('app/images/'))
        .pipe(src('app/images/src/**/*'))
        .pipe(newer('app/images/'))
        .pipe(webp())
        .pipe(src('app/images/src/**/*'))
        .pipe(newer('app/images/'))
        .pipe(imagemin())
        .pipe(dest('app/images/'))
}

function sprite() {
    return src('app/images/*.svg')
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: '../sprite.svg',
                    example: true
                }
            }
        }))
        .pipe(dest('app/images'))
}

function scripts() {
    return src([
        'app/js/lazyload.min.js',
        'app/js/main.js',
        ])
       .pipe(babel())
       .pipe(concat('main.min.js'))
       .pipe(uglify())
       .pipe(dest('app/js'))
       .pipe(browserSync.stream())
}

function php() {
    return src('app/mail/mail.php')
       .pipe(concat('mail.php'))
       .pipe(dest('app'))
       .pipe(browserSync.stream())
}

function styles() {
    return src([
        'node_modules/normalize.css/normalize.css',
        'app/scss/**/*.scss'
       ])
      .pipe(scss({ outputStyle: 'compressed' }))
      .pipe(autoprefixer({ overrideBrowserslist: ['last 10 version']}))
      .pipe(concat('style.min.css'))
      .pipe(dest('app/css'))
      .pipe(browserSync.stream())
}

function watching() {
    browserSync.init({
        server: {
            baseDir: "app/"
        }
    });
    watch(['app/scss/**/*.scss'], styles)
    watch(['app/images/src'], images)
    watch(['app/js/main.js'], scripts)
    watch(['app/mail/mail.php'], php)
    watch(['app/components/*', 'app/pages/*'], pages)
    watch(['app/*.html']).on('change', browserSync.reload);
}

function cleanDocs() {
    return src('docs')
       .pipe(clean())
}

function building() {
    return src([
        'app/css/style.min.css',
        '!app/images/**/*.html',
        'app/images/**/*',
        'app/images/*.svg',
        '!app/images/sprite.svg',
        'app/fonts/*.*',
        'app/mail.php',
        'app/js/main.min.js',
        'app/**/*.html'
    ], {base : 'app'})
       .pipe(dest('docs'))
}

exports.styles = styles;
exports.images = images;
exports.fonts = fonts;
exports.pages = pages;
exports.building = building;
exports.sprite = sprite;
exports.scripts = scripts;
exports.php = php;
exports.watching = watching;


exports.build = series(cleanDocs, building);
exports.default = parallel(styles, images, scripts,  php, pages, watching);