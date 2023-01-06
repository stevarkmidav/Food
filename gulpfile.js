import { task, src, dest, watch as _watch, parallel } from "gulp";
import webpack from "webpack-stream";
const sass = require('gulp-sass')(require('sass'));
import autoprefixer from "autoprefixer";
import cleanCSS from "gulp-clean-css";
import postcss from "gulp-postcss";
import { stream, init } from "browser-sync";

const dist = "./dist";

task("copy-html", () => {
    return src("./src/index.html")
                .pipe(dest(dist))
                .pipe(stream());
});

task("build-js", () => {
    return src("./src/js/main.js")
                .pipe(webpack({
                    mode: 'development',
                    output: {
                        filename: 'script.js'
                    },
                    watch: false,
                    devtool: "source-map",
                    module: {
                        rules: [
                          {
                            test: /\.m?js$/,
                            exclude: /(node_modules|bower_components)/,
                            use: {
                              loader: 'babel-loader',
                              options: {
                                presets: [['@babel/preset-env', {
                                    debug: true,
                                    corejs: 3,
                                    useBuiltIns: "usage"
                                }]]
                              }
                            }
                          }
                        ]
                      }
                }))
                .pipe(dest(dist + '/js'))
                .pipe(stream());
});

task("build-sass", () => {
    return src("./src/scss/**/*.scss")
                .pipe(sass().on('error', sass.logError))
                .pipe(dest(dist + '/css'))
                .pipe(stream());
});

task("copy-assets", () => {
    src("./src/icons/**/*.*")
        .pipe(dest(dist + "/icons"));

    return src("./src/img/**/*.*")
                .pipe(dest(dist + "/img"))
                .pipe(stream());
});

task("watch", () => {
    init({
		server: "./dist/",
		port: 4000,
		notify: true
    });

    _watch("./src/index.html", parallel("copy-html"));
    _watch("./src/icons/**/*.*", parallel("copy-assets"));
    _watch("./src/img/**/*.*", parallel("copy-assets"));
    _watch("./src/scss/**/*.scss", parallel("build-sass"));
    _watch("./src/js/**/*.js", parallel("build-js"));
});

task("build", parallel("copy-html", "copy-assets", "build-sass", "build-js"));

task("prod", () => {
    src("./src/index.html")
        .pipe(dest(dist));
    src("./src/img/**/*.*")
        .pipe(dest(dist + "/img"));
    src("./src/icons/**/*.*")
        .pipe(dest(dist + "/icons"));

    src("./src/js/main.js")
        .pipe(webpack({
            mode: 'production',
            output: {
                filename: 'script.js'
            },
            module: {
                rules: [
                  {
                    test: /\.m?js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                      loader: 'babel-loader',
                      options: {
                        presets: [['@babel/preset-env', {
                            debug: false,
                            corejs: 3,
                            useBuiltIns: "usage"
                        }]]
                      }
                    }
                  }
                ]
              }
        }))
        .pipe(dest(dist + '/js'));
    
    return src("./src/scss/style.scss")
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([autoprefixer()]))
        .pipe(cleanCSS())
        .pipe(dest(dist + '/css'));
});

task("default", parallel("watch", "build"));