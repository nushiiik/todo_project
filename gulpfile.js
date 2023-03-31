const { src, dest, task, series, watch, parallel } = require("gulp");
const rm = require('gulp-rm');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const autoprefixer = require('gulp-autoprefixer');
const gcmq = require('gulp-group-css-media-queries');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const svgSprite = require('gulp-svg-sprite');
const gulpif = require('gulp-if');

const env = process.env.NODE_ENV;

const {SRC_PATH, DIST_PATH, STYLE_LIBS, JS_LIBS} = require('./gulp.config');

task( 'clean', () => {
    return src( `${DIST_PATH}/**/*`, { read: false })
        .pipe( rm() );
});

task('copy:html', () => {
    return src(`${SRC_PATH}/*.html`)
        .pipe(dest(DIST_PATH))
        .pipe(reload({ stream: true }));
});

task('styles', () => {
    return src([...STYLE_LIBS, 'src/styles/main.scss'])
        .pipe(gulpif(env === 'dev', sourcemaps.init()))
        .pipe(concat('main.min.scss'))
        .pipe(sass().on('error', sass.logError))
        .pipe(gulpif(env === 'prod', autoprefixer({
            cascade: false
        })))
        .pipe(gulpif(env === 'prod', gcmq()))
        .pipe(gulpif(env === 'prod', cleanCSS()))
        .pipe(gulpif(env === 'dev', sourcemaps.write()))
        .pipe(dest(DIST_PATH))
        .pipe(reload({ stream: true }));
});

task('copy:images', () => {
    return src(`${SRC_PATH}/images/icons/*.svg`)
        .pipe(dest(`${DIST_PATH}/images/icons`))
        .pipe(reload({ stream: true }));
});

task('server', () => {
    browserSync.init({
        server: {
            baseDir: "./dist"
        },
        open: false
    });
});

task('watch', () => {
    watch('./src/styles/**/*.scss', series('styles'));
    watch('./src/*.html', series('copy:html'));
    watch('./src/images/icons/*.svg', series('copy:images'));
});

task('default',
    series('clean',
        parallel ('copy:html', 'styles', 'copy:images'),
        parallel ('watch', 'server')
    )
);

task('build',
    series('clean',
        parallel ('copy:html', 'styles', 'copy:images')
    )
);
