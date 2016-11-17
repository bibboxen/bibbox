#!/usr/bin/env node

'use strict';

var gulp = require('gulp');
var eslint = require('gulp-eslint');

var node_paths = [
  './plugins/**/*.js',
  './*.js',
  '!./plugins/**/node_modules/**',
  '!./node_modules/**'
];

var ui_paths = [
  './public/js/*.js',
  './public/js/**/*.js',
  '!./public/js/lib/*/'
];

var test_paths = [
  './test/*.js'
];

gulp.task('ui_lint', function () {
  return gulp.src(ui_paths)
    .pipe(eslint({
      globals: [
        'angular',
        'CryptoJS',
        'io'
      ],
      envs: [
        'browser'
      ]
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('node_lint', function () {
  return gulp.src(node_paths)
    .pipe(eslint({
      globals: [
        'console'
      ],
      envs: [
        'node'
      ]
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test_lint', function () {
  return gulp.src(test_paths)
    .pipe(eslint({
      globals: [
        'setupArchitect',
        'it',
        'should',
        'describe',
        'supertest',
        'server',
        'assert',
        'sinon'
      ],
      envs: [
        'node'
      ]
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});


gulp.task('default', ['ui_lint', 'node_lint'], function () {
  // This will only run if the lint task is successful...
});
