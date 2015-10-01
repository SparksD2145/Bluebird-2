var gulp = require('gulp'),
    server = require('gulp-develop-server'),
    del = require('del'),
    uglify = require('gulp-uglify'),
    jscs = require('gulp-jscs');

gulp.task('default', ['server:dev']);

gulp.task('server', ['server:dev']);

// Development Environment
gulp.task('server:dev', function() {
    server.listen({
        path: './Bluebird.js',
        env: {
            NODE_ENV: 'development',
            DB_ADDRESS: '',
            BBY_API_KEY: '',
            PORT: 80,
            DEBUG: '*'
        }
    });
});

// Prod-Test Environment
gulp.task('server:prod', ['build'], function() {
    return server.listen({
        path: './Bluebird.js',
        env: {
            NODE_ENV: 'production',
            DB_ADDRESS: 'mongodb://localhost:27017/bluebird',
            BBY_API_KEY: '',
            PORT: 80
        }
    });
});

gulp.task('build', ['clean:build', 'copy:build', 'compress:build']);

gulp.task('clean:css', function () {
    return del(['build/**/*.css']);
});

gulp.task('clean:build', function () {
    return del(['build']);
});

gulp.task('copy:build', ['clean:build'], function() {
    return gulp.src('src/**/*')
        .pipe(gulp.dest('build'));
});

gulp.task('compress:build', ['copy:build'], function () {
    return gulp.src('build/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('build'));
});

gulp.task('jscs', function () {
    gulp.src('src/**/*.js')
        .pipe(jscs())
        .pipe(jscs.reporter());
});

gulp.task('jscs:fix', function () {
    gulp.src('src/**/*.js')
        .pipe(jscs({ fix: true }))
        .pipe(jscs. reporter())
        .pipe(jscs. reporter('fail'))
        .pipe(gulp.dest('src/'));
});