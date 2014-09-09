# AngularJS generator [![Build Status](https://secure.travis-ci.org/yeoman/generator-angular.svg?branch=master)](http://travis-ci.org/yeoman/generator-angular)

> Yeoman generator for AngularJS - lets you quickly set up a project with sensible defaults and best practices.

[Roadmap for upcoming plans/features/fixes](https://github.com/yeoman/generator-angular/issues/553)

## Usage

Install `generator-angular`:
```
npm install -g generator-angular
```

Make a new directory, and `cd` into it:
```
mkdir my-new-project && cd $_
```

Run `yo angular`, optionally passing an app name:
```
yo angular [app-name]
```

Run `grunt` for building and `grunt serve` for preview


## Generators

Available generators:

* [angular](#app) (aka [angular:app](#app))

**Note: Generators are to be run from the root directory of your app.**

### App
Sets up a new AngularJS app, generating all the boilerplate you need to get started. The app generator also optionally installs Bootstrap and additional AngularJS modules, such as angular-resource (installed by default).

Example:
```bash
yo angular
```

### Add to Index
By default, new scripts are added to the index.html file. However, this may not always be suitable. Some use cases:

* Manually added to the file
* Auto-added by a 3rd party plugin
* Using this generator as a subgenerator

To skip adding them to the index, pass in the skip-add argument:
```bash
yo angular:service serviceName --skip-add
```

## Bower Components

The following packages are always installed by the [app](#app) generator:

* angular
* angular-mocks
* angular-scenario


The following additional modules are available as components on bower, and installable via `bower install`:

* angular-cookies
* angular-loader
* angular-resource
* angular-sanitize

All of these can be updated with `bower update` as new versions of AngularJS are released.
