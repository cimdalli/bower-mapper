/*
 * bower-mapper
 * http://gruntjs.com/
 *
 */

'use strict';

var fse = require('fs-extra');


module.exports = function (grunt) {

    // Use either data section of task or options section
    var checkOption = function (key, defaultData, firstCheck, secondCheck) {
        if (firstCheck && firstCheck[key]) {
            return firstCheck[key];
        }
        else if (secondCheck && secondCheck[key]) {
            return secondCheck[key];
        }
        return defaultData;
    };

    var convertArray = function (data) {
        if (!Array.isArray(data)) {
            return [data];
        }
        return data;
    };

    var convertPath = function () {
        return Array.prototype.slice.call(arguments).filter(function (arg) {
            return !!arg;
        }).join("/");
    };

    var checkType = function (data) {
        if (typeof data === "string")
            return "string";
        else if (Array.isArray(data))
            return "array";
        return typeof data;
    }

    var selectObject = function (data, useMin) {
        var result = [];
        switch (checkType(data)) {
            case "string":
                result = [data]; break;
            case "array":
                result = result.concat(data.map(function (element) {
                    return selectObject(element, useMin);
                })).join(",").split(",");
                break;
            case "object":
                for (var key in data) {
                    var value = data[key];
                    var selection = key;
                    if (!!value) {
                        if (checkType(value) === "string") {
                            selection = useMin ? value : key;
                        } else {
                            selection = selectObject(data, useMin);
                        }
                    }
                    result.push(selection);
                }
                break;
        }
        return result;
    };

    var jsonSelector = function (data, selector) {
        if (Array.isArray(selector) && selector.length > 0) {
            var select = selector.shift();
            return jsonSelector(data[select], selector);
        } else {
            return data;
        }
    }

    var componentSelector = function (json, selector, seperator, baseSelector, useMin) {
        if (!!json) {
            // Expected selector types
            // 1. String selector (w/o seperator)
            // 2. Array selector

            if (checkType(selector) === "string") {
                if (selector.indexOf(seperator) != -1) { // Case that selector with seperator | ex. "jquery:js"
                    selector = selector.split(seperator);
                } else { // Case that selector without seperator | ex. "jquery"
                    selector = [selector, baseSelector];
                }
                return componentSelector(json, selector, seperator, baseSelector, useMin);
            }
            else if (Array.isArray(selector)) { // All selection operations need Array selector
                var componentName = selector[0];
                var selectedData = jsonSelector(json, selector); // First selection data

                return selectObject(selectedData, useMin)
                    .filter(function (selection) { return !!selection; })
                    .map(function (selection) {
                        return convertPath(componentName, selection);
                    });
            }
            return undefined;
        }
    };


    grunt.registerMultiTask('bower-mapper', 'Concatenate or copy selected files that is defined in bower.mapper and configured in grunt task', function () {

        var config = grunt.config('bower-mapper') || grunt.config('bowerMapper');
        var options = config.options;
        var target = this.target;
        var data = this.data;

        var mapperPath = checkOption("mapper", "bower.mapper.json", options);
        var componentPath = checkOption("components", "bower_components", options);
        var seperator = checkOption("seperator", ":", data, options);
        var cwd = checkOption("cwd", null, options);
        var dest = checkOption("dest", null, data);
        var useMin = !!checkOption("useMin", null, data, options);
        var concat = !!checkOption("concat", null, data, options);

        var mapper = grunt.file.readJSON(convertPath(cwd, mapperPath));

        try {
            var src = convertArray(data.src);
            var srcFiles = [];

            src.filter(function (component) {
                try {
                    var components = componentSelector(mapper, component, seperator, target, useMin);
                    if (components && components.length) {
                        components.filter(function (file) {
                            grunt.log.ok("Selected file: " + file['cyan']);
                            srcFiles = srcFiles.concat(file);
                        });
                    } else {
                        grunt.log.error("Selected file not found: " + component);
                    }
                } catch (e) {
                    grunt.log.error(e);
                }
            });

            srcFiles = srcFiles
                .map(function (filepath) {
                    return convertPath(cwd, componentPath, filepath);
                }).filter(function (filepath) {
                    if (!grunt.file.exists(filepath)) {
                        grunt.log.warn('Source file "' + filepath + '" not found.');
                        return false;
                    } else {
                        return true;
                    }
                });

            if (concat) {
                // If no dest file is specified, default file pattern is like "bower.[js|css]"
                if (!dest) {
                    dest = "bower." + target;
                }

                var destFile = convertPath(cwd, dest);
                var srcData = srcFiles.map(function (filePath) {
                    return grunt.file.read(filePath);
                }).join(grunt.util.linefeed);

                fse.outputFileSync(destFile, srcData, 'utf8');
                grunt.log.ok('Components are merged to ' + destFile['cyan']);
            }
            else {
                var destPath = convertPath(cwd, dest);

                srcFiles.forEach(function (srcFile) {
                    var fileName = srcFile.split('\\').pop().split('/').pop();
                    var destFile = convertPath(destPath, fileName);
                    fse.copySync(srcFile, destFile);
                    grunt.log.ok('Component is copied to ' + destFile['cyan']);
                });
            }
        }
        catch (e) {
            grunt.log.error(e);
        }
    });

};
