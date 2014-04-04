/*global module:false*/
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON('package.json'),
		banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
			'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
			' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
		// Task configuration.
		concat: {
			options: {
				banner: '<%= banner %>',
				stripBanners: true
			},
			dist: {
				src: [
					'assets/bower_components/jquery/dist/jquery.min.js', // take this out for WP dev
					'assets/plugins/*.js',
					'assets/main.js'
				],
				dest: 'dist/<%= pkg.name %>.min.js'
			}
		},
		uglify: {
			options: {
				banner: '<%= banner %>'
			},
			dist: {
				src: '<%= concat.dist.dest %>',
				dest: 'dist/<%= pkg.name %>.min.js'
			},
			modernizr: {
				src: 'assets/bower_components/modernizr/modernizr.js',
				dest: 'dist/modernizr.min.js'
			}
		},
		compass: {
			dist: {
				options:{
					outputStyle: 'compressed',
					config: 'config.rb',
				},
			},
			patterns: {
				options: {
					cssDir: 'patterns/public/styleguide/css',
					outputStyle: 'nested'
				}
			},
		},
		copy: {
			main: {
				files: [
					{ expand: true, cwd: 'patterns/source/js/', src: '*', dest: 'patterns/public/js/'},
					{ expand: true, cwd: 'patterns/source/css/', src: ['style.css'], dest: 'patterns/public/css/' },
					{ expand: true, cwd: 'patterns/source/images/', src: '*', dest: 'patterns/public/images/' },
					{ expand: true, cwd: 'patterns/source/images/sample/', src: '*', dest: 'patterns/public/images/sample/'},
					{ expand: true, cwd: 'patterns/source/fonts/', src: '*', dest: 'patterns/public/fonts/'}
				]
			}
		},
		autoprefixer: {
			options:{
				browsers: ['last 2 version', 'ie 8', '> 5%']
			},
			dist: {
				src: 'dist/<%= pkg.name %>.css',
				dest: 'dist/<%= pkg.name %>.css'
			},
		},
		coffee: {
			dist: {
				expand: true,
				flatten: true,
				cwd: 'src/scripts/',
				src: ['*.coffee'],
				dest: 'assets/scripts/compiled',
				ext: '.js'
			}
		},
		coffee_jshint: {
			source: {
				src: ['assets/scripts/**/*.coffee']
			},
		},
		pixrem: {
			options: {
				rootvalue: '100%' // Set this to be the same as your stylesheet
			},
			dist: {
				src: 'dist/<%= pkg.name %>.css',
				dest: 'dist/<%= pkg.name %>.css'
			}
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				unused: true,
				boss: true,
				eqnull: true,
				browser: true,
				globals: {
					jQuery: true
				}
			},
			gruntfile: {
				src: 'Gruntfile.js'
			},
			patternlab: ['Gruntfile.js', './builder/lib/patternlab.js']
		},
		imagemin: {
			dist:{
				files: [{
					expand: true,
					cwd: 'assets/img',
					src: ['**/*.{png,jpg,gif}'],
					dest: 'dist/img/'
				}]
			}
		},
		qunit: {
			files: ['test/**/*.html']
		},
		watch: {

			gruntfile: {
				files: '<%= jshint.gruntfile.src %>',
				tasks: ['jshint:gruntfile', 'buildscripts', 'buildstyles','optimizeimages']
			},
			mustache: {
				files: ['./patterns/source/_patterns/**/*.mustache'],
				tasks: ['buildpatterns']
			},
			scripts:{
				files: ['assets/scripts/**/*.js', 'assets/scripts/**/*.coffee'],
				tasks: ['buildscripts'],
			},
			styles:{
				files: ['assets/styles/**/*.scss'],
				tasks: ['buildstyles'],
			},
			reload:{
				files: ['dist/**/*.css', 'dist/**/*.js', '**/*.html'],
				options:{
					livereload: true,
				}
			},
			images:{
				files: ['assets/img/**/*.{png, jpg, gif}'],
				tasks: ['optimizeimages']
			},
			data: {
				files: ['patterns/source/_patterns/**/*.json'],
				tasks: ['buildpatterns']
			}
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-coffee');
	grunt.loadNpmTasks('grunt-coffee-jshint');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-pixrem');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-copy');

	//load the patternlab task
	grunt.task.loadTasks('./patterns/builder/');

	// Default task.
	grunt.registerTask('default', ['buildscripts', 'buildstyles', 'optimizeimages', 'buildpatterns']);
	grunt.registerTask('buildpatterns', ['patternlab', 'copy']);
	grunt.registerTask('buildscripts', ['coffee_jshint', 'coffee', 'concat', 'uglify']);
	grunt.registerTask('buildstyles', ['compass', 'autoprefixer','pixrem']);
	grunt.registerTask('optimizeimages', ['imagemin']);
};
