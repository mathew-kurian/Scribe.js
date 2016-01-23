'use strict';

module.exports = function (grunt) {
  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    uglify: {
      options: {
        banner: '/*! Grunt Uglify <%= grunt.template.today("yyyy-mm-dd") %> */ ',
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
          src: ['**/*.js','*.js'],
          dest: 'dist/',
          ext: '.js'
        }]
      }
    },
    browserify: {
      dist: {
        options: {
          transform: ["babelify"],
          browserifyOptions: {
            debug: true, // source mapping
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
          transform: ["babelify"],
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
            browsers: ['Chrome > 20']
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
    clean: ["public/", "./package.noDevDeps.json", "dist/"]
  });

  var lastNodeEnv;
  grunt.registerTask('env-force-production', '', function () {
    lastNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
  });

  grunt.registerTask('env-restore', '', function () {
    process.env.NODE_ENV = lastNodeEnv;
  });

  grunt.registerTask('get-deps', '', function () {
    var done = this.async();
    var pkg = require('./package.json');
    var fs = require('fs');
    var exec = require('child_process').exec;

    delete pkg.devDependencies;

    fs.writeFileSync('package.noDevDeps.json', JSON.stringify(pkg), "utf8");

    exec('node node_modules/license-report/index.js --package=./package.noDevDeps.json --output=json',
        function (err, stdout, stderr) {
          if (err || stderr) console.error(err, stderr);
          else fs.writeFileSync('deps.json', JSON.stringify(JSON.parse(stdout), null, 2), "utf8");
          fs.unlinkSync('package.noDevDeps.json');
          done();
        })
  });

  grunt.registerTask('styles', ['sass:dist', 'postcss:dist']);
  grunt.registerTask('build', ['get-deps', 'sass:dist', 'postcss:dist', 'browserify:dist', 'copy', 'imagemin']);
  grunt.registerTask('default', 'build');
  grunt.registerTask('auto-build-scripts', ['browserify:dev']);
  grunt.registerTask('auto-build-styles', ['sass:dev', 'watch:sass']);
  grunt.registerTask('production', ['env-force-production', 'clean', 'build', 'uglify:dist', 'babel', 'env-restore']);
};