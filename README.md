# bower-mapper

Grunt task to (concatenate and) copy bower components depends on map file

## Overview
Most of bower components have their minified versions and resources (fonts, images etc.) in their file structure. To copy required files, you can define them in your grunt file but it may hard to handle. By that library, you can define a grunt task to select required libraries and resources as well as concatenation option.

## Getting Started

Installation:
```shell
npm install bower-mapper --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('bower-mapper')
```

## The "mapper" file

### Overview
You can define bower components and sub categories via mapper file. 

Simple "bower.mapper.json" file

```json
{
    "jquery": {
        "js": { "dist/jquery.js": "dist/jquery.min.js" }
    },
    "bootstrap": {
        "js": { "dist/js/bootstrap.js": "dist/js/bootstrap.min.js" },
        "css": [
            { "dist/css/bootstrap.css": "dist/css/bootstrap.min.css" },
            { "dist/css/bootstrap-theme.css": "dist/css/bootstrap-theme.min.css" }
        ],
        "fonts": [
            "dist/fonts/glyphicons-halflings-regular.eot",
            "dist/fonts/glyphicons-halflings-regular.ttf",
            "dist/fonts/glyphicons-halflings-regular.woff"
        ]
    },
    "angular": {
        "js": { "angular.js": "angular.min.js" }
    }
}
```

There is 3 diffirent supported node type.

### Node types

1. Object type
 	```coffee
	{ "dist/jquery.js": "dist/jquery.min.js" }
    ```
    
	In that format, key stands for path of original file and value for its minified version. All dependencies resolved by root key name and it should match to downloaded bower component name.
 
2. String type
 	```coffee
    "angular": {
        "js": "angular.min.js"
    }
    ```
	If no futher configuration is needed, string type of node can be used for defination.


3. Array type
 	```coffee
    "fonts": [ "dist/fonts/glyphicons-halflings-regular.eot",
            	"dist/fonts/glyphicons-halflings-regular.ttf",
            	"dist/fonts/glyphicons-halflings-regular.woff" ]
    ```
	This format can be used for multi selection like font or other kind of resources (images, icons etc.)

## The "bower-mapper" task

### Overview
In your project's Gruntfile, add a section named `"bower-mapper"` to the data object passed into `grunt.initConfig()`.

```coffee
grunt.initConfig(
    'bower-mapper': {
         js: {
             src: ["underscore", "jquery", "bootstrap", "angular", "angular-animate", "angular-route"],
             dest: "libs.js",
             concat: true,
             useMin: true
         },
         css: {
             src: ["fontawesome", "bootstrap"],
             dest: "css",
             useMin: true
         },
         fonts: {
             src: ["fontawesome", "bootstrap"],
             dest: "fonts"
         }
    }
)
```
