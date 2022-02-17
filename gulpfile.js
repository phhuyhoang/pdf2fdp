const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const gulp = require('gulp');
const nodemon = require('nodemon');
const del = require('del');

const sass = require('gulp-sass')(require('sass'));
const minify = require('gulp-minify');
const cleancss = require('gulp-clean-css');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const browserify = require('gulp-browserify');
const autoprefixer = require('gulp-autoprefixer');
const FileCache = require('gulp-file-cache');


const filecache = new FileCache();


const paths = {
    server: path.resolve('server.js'),
    source: {
        root: path.resolve('./back-end/views/'),
        scripts: path.resolve('./front-end/src/scripts'),
        styles: path.resolve('./front-end/src/styles'),
    },
    dest: {
        scripts: path.resolve('./front-end/public/scripts'),
        styles: path.resolve('./front-end/public/styles'),
    },
};


const help = {
    createHash: function createHash(data, algo, len) {
        return crypto.createHash(algo, { outputLength: len })
            .update(data)
            .digest('hex')
            .toString();
    }
}


gulp.task('clean', function () {
    console.log('\tClean up build folder...');
    return del([ paths.dest.styles, paths.dest.scripts ]);
});


gulp.task('compile-scss', function () {
    return gulp.src(path.join(paths.source.styles, '*.scss'))
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 2 versions'],
            cascade: false
        }))
        .pipe(cleancss({ debug: true }, details => {
            console.log(`${details.name}: ${details.stats.originalSize}`);
            console.log(`${details.name}: ${details.stats.minifiedSize}`);
        }))
        .pipe(rename(function ($path) {
            const basename = $path.basename;
            const extname = $path.extname;
            const hashname = help.createHash($path.basename, 'shake256', 10);
            $path.basename = hashname;
            console.log(`Hashed ${basename}${extname} to ${hashname}${extname}`);
        }))
        .pipe(gulp.dest(paths.dest.styles))
});


gulp.task('uglify-js', function () {
    const scripts = fs.readdirSync(paths.source.scripts, { withFileTypes: true })
        .filter(file => file.isFile())
        .map(file => path.join(paths.source.scripts, file.name));

    return gulp.src(scripts)
        .pipe(
            babel({
                presets: [
                    "@babel/env",
                ]
            })
        )
        .pipe(browserify())
        .pipe(minify({
            ext: {
                min: '.js'
            },
            noSource: true,
            preserveComments: true,
        }))
        .pipe(rename(function ($path) {
            const basename = $path.basename;
            const extname = $path.extname;
            const hashname = help.createHash($path.basename, 'shake256', 10);

            $path.basename = hashname;
            console.log(`Hashed ${basename}${extname} to ${hashname}${extname}`);
        }))
        .pipe(gulp.dest(paths.dest.scripts))
});


gulp.task('watch', function () {
    gulp.watch(path.join(paths.source.styles, '**/*.scss'), gulp.series('compile-scss'));
    gulp.watch(path.join(paths.source.scripts, '**/*.js'), gulp.series('uglify-js'));
    gulp.watch(path.join(paths.source.root, 'public/**/*.hbs'), gulp.parallel('compile-scss'));
});


gulp.task('serve', function () {
    return nodemon({
        script: paths.server,
    })
    .on('start', function onServerStart() {
        console.log('[nodemon] Starting server...');
    })
    .on('restart', function onServerRestart() {
        console.log('[nodemon] Restarting server...');
    })
    .on('crash', function onServerCrash() {
        console.log('[nodemon] Server crash.');
    })
});


gulp.task('compile', gulp.series('clean', gulp.parallel('compile-scss', 'uglify-js')));
gulp.task('default', gulp.series('compile', gulp.parallel('watch', 'serve')));
