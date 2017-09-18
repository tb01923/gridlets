/**
 * GULP file tasks
 */

const
    env = require('env2')('./package.json'),
    gulp = require("gulp"),
    clean = require('gulp-clean'),
    run = require('gulp-run'),
    runSequence = require('run-sequence');

gulp.task('pack', function () {
    console.log('┌────────────────────────────────────────┐');
    console.log('│ Packing module with NPM                │ ');
    console.log('└────────────────────────────────────────┘');
    return run('npm pack').exec()
        .pipe(gulp.dest('output'));
});

gulp.task('build', function() {
    console.log('┌────────────────────────────────────────┐');
    console.log('│ Installing the package globally        │');
    console.log('└────────────────────────────────────────┘');
    return run(`npm install -g ${process.env.name}-${process.env.version}.tgz`).exec()
        .pipe(gulp.dest('output'));
});

gulp.task('clean', function () {
    console.log('┌────────────────────────────────────────┐');
    console.log('│ A little housekeeping                  │ ');
    console.log('└────────────────────────────────────────┘');
    return gulp.src(`${process.env.name}-${process.env.version}.tgz`, {read: false})
        .pipe(clean());
});

gulp.task('install', function(callback) {
    runSequence('pack', 'build', 'clean')
});