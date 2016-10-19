#!/usr/bin/env node

const gulp = require('gulp');
const eslint = require('gulp-eslint');

var paths = [
  './plugins/**/*.js',
  './public/js/*.js',
  './public/js/**/*.js',
  '!./node_modules/**',
  '!./public/js/lib/*/',
  '!./plugins/**/node_modules/**'
];

gulp.task('lint', function () {
  return gulp.src(paths)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('default', ['lint'], function () {
  // This will only run if the lint task is successful...
});