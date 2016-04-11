'use strict';

module.exports = function (grunt) {
  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);

  const gruntConfig = {
    uglify: {
      options: {
        banner: '/*! Grunt Uglify <%= grunt.template.today(\'yyyy-mm-dd\') %> */ ',
        compress: {
          drop_console: true
        }
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'public/scripts',
          src: ['**/*.js'],
          dest: 'public/scripts',
          ext: '.min.js'
        }]
      }
    },
    sass: {
      dev: {
        options: {
          style: 'expanded'
        },
        files: [{
          expand: true,
          cwd: 'resources/styles',
          src: ['*.scss'],
          dest: 'public/styles',
          ext: '.min.css'
        }]
      },
      dist: {
        options: {
          style: 'compressed',
          sourcemap: 'none'
        },
        files: [{
          expand: true,
          cwd: 'resources/styles',
          src: ['*.scss'],
          dest: 'public/styles',
          ext: '.min.css'
        }]
      }
    },
    babel: {
      options: {
        sourceMap: false
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['**/*.js', '*.js'],
          dest: 'dist/',
          ext: '.js'
        }]
      }
    },
    browserify: {
      dist: {
        options: {
          transform: ['babelify'],
          browserifyOptions: {
            debug: false, // source mapping
            ignoreMTime: true
          }
        },
        files: [{
          expand: true,
          cwd: 'asr/',
          src: ['**/Bootstrap.jsx', 'Bootstrap.jsx', '**/Bootstrap.js', 'Bootstrap.js'],
          dest: 'public/scripts/',
          ext: '.min.js'
        }]
      },
      dev: {
        options: {
          watch: true,
          keepAlive: true,
          transform: ['babelify'],
          browserifyOptions: {
            debug: true, // source mapping
            ignoreMTime: true
          }
        },
        files: [{
          expand: true,
          cwd: 'asr/',
          src: ['**/Bootstrap.jsx', 'Bootstrap.jsx', '**/Bootstrap.js', 'Bootstrap.js'],
          dest: 'public/scripts',
          ext: '.min.js' // NOTE mimic uglifyjs has been run
        }]
      }
    },
    postcss: {
      options: {
        map: false,
        processors: [
          require('autoprefixer')({
                                    browsers: ['> 1%']
                                  })
        ]
      },
      dist: {
        src: 'public/styles/*.css'
      }
    },
    imagemin: {
      dist: {
        options: {
          optimizationLevel: 3,
          svgoPlugins: [{removeViewBox: false}]
        },
        files: [{
          expand: true,
          cwd: 'resources/images',
          src: ['**/*.{png,jpg,gif}'],
          dest: 'public/images'
        }]
      }
    },
    copy: {
      dist: {
        files: [
          {expand: true, cwd: 'resources/fonts', src: ['**/*'], dest: 'public/fonts'},
          {expand: true, cwd: 'resources/scripts', src: ['**/*'], dest: 'public/scripts'}
        ]
      }
    },
    watch: {
      sass: {
        files: ['resources/styles/*.scss', 'resources/styles/**/*.scss'],
        tasks: ['sass:dev'],
        options: {
          spawn: false
        }
      }
    },
    clean: ['public/', 'dist/']
  };

  grunt.initConfig(gruntConfig);

  grunt.registerTask('styles', ['sass:dist', 'postcss:dist']);
  grunt.registerTask('build', ['sass:dist', 'postcss:dist', 'browserify:dist', 'copy', 'imagemin', 'babel']);
  grunt.registerTask('default', 'build');
  grunt.registerTask('watch-scripts', ['browserify:dev']);
  grunt.registerTask('watch-styles', ['sass:dev', 'watch:sass']);
  grunt.registerTask('production', ['clean', 'build', 'uglify:dist']);
};