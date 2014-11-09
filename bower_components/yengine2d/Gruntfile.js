module.exports = function (grunt) {
    var banner = '/*!\n' +
        ' <%= bowerConfig.name %>\n <%= bowerConfig.description%>\n\n ' +
        'version: <%= bowerConfig.version%>\n ' +
        'author: <%= bowerConfig.authors.name%>\n email: <%= bowerConfig.authors.email%>\n qq: <%= bowerConfig.authors.qq%>\n blog: <%= bowerConfig.authors.blog%>\n ' +
        'homepage: <%= bowerConfig.homepage%>\n repository: <%= bowerConfig.repository%>\n ' +
        'license: <%=bowerConfig.license%>\n ' +
        'date: <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '*/\n';

    grunt.initConfig({
        bowerConfig: grunt.file.readJSON('bower.json'),

        clean: {
            build: {
                src: 'dist'
            }
        },
        concat: {
            options: {
                separator: '\n',
                banner: banner,
                stripBanners:true
            },
            dist: {
                src: [
                    'src/main.js',
                    'src/import/jsExtend.js',
                    'src/import/yeQuery.js' ,

                    'src/base/Entity.js',
                    'src/base/Node.js',
                    'src/base/*.js',

                    'src/action/Action.js',
                    'src/action/ActionInstant.js',
                    'src/action/ActionInterval.js',
                    'src/action/Control.js',

                    'src/loader/Loader.js',

                    'src/**/*.js'
                ],
                dest: 'dist/yEngine2D.js'
            }
        },
        uglify: {
            options: {
                banner: banner
            },
            build: {
                src: 'dist/yEngine2D.js',
                dest: 'dist/yEngine2D.min.js'
            }
        },
//        jshint: {
//            all: ['dist/*.js']
//        },
        karma: {
            unit: {
                configFile: 'test/karma.conf.js',
                autoWatch: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-karma');
    grunt.registerTask('test', ['karma']);

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
//    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.registerTask('build', ['clean', 'concat', 'uglify']);
};