'use strict';
var fs = require('fs');
var path = require('path');
var util = require('util');
var angularUtils = require('../util.js');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var wiredep = require('wiredep');
var chalk = require('chalk');

var Generator = module.exports = function Generator(args, options) {
  yeoman.generators.Base.apply(this, arguments);
  this.argument('appname', { type: String, required: false });
  this.appname = this.appname || path.basename(process.cwd());
  this.basename = path.basename(process.cwd());
  this.appname = this._.camelize(this._.slugify(this._.humanize(this.appname)));

  this.option('app-suffix', {
    desc: 'Allow a custom suffix to be added to the module name',
    type: String,
    required: 'false'
  });
  this.env.options['app-suffix'] = this.options['app-suffix'];
  this.scriptAppName = this.appname + angularUtils.appName(this);

  args = ['main'];

  if (typeof this.env.options.appPath === 'undefined') {
    this.option('appPath', {
      desc: 'Generate CoffeeScript instead of JavaScript'
    });

    this.env.options.appPath = this.options.appPath;

    if (!this.env.options.appPath) {
      try {
        this.env.options.appPath = require(path.join(process.cwd(), 'bower.json')).appPath;
      } catch (e) {}
    }
    this.env.options.appPath = this.env.options.appPath || 'app';
    this.options.appPath = this.env.options.appPath;
  }

  this.appPath = this.env.options.appPath;

  this.hookFor('pureweb-angular:common', {
    args: args
  });

  this.hookFor('pureweb-angular:main', {
    args: args
  });

  this.hookFor('pureweb-angular:controller', {
    args: args
  });

  this.on('end', function () {
    var enabledComponents = [];

    if (this.animateModule) {
      enabledComponents.push('angular-animate/angular-animate.js');
    }

    if (this.cookiesModule) {
      enabledComponents.push('angular-cookies/angular-cookies.js');
    }

    if (this.resourceModule) {
      enabledComponents.push('angular-resource/angular-resource.js');
    }

    if (this.routeModule) {
      enabledComponents.push('angular-route/angular-route.js');
    }

    if (this.sanitizeModule) {
      enabledComponents.push('angular-sanitize/angular-sanitize.js');
    }

    if (this.touchModule) {
      enabledComponents.push('angular-touch/angular-touch.js');
    }

    enabledComponents = [
      'angular/angular.js',
      'angular-mocks/angular-mocks.js'
    ].concat(enabledComponents).join(',');
    
    this.invoke('karma:app', {
      options: {        
        'base-path': '../',        
        'travis': true,
        'bower-components': enabledComponents,
        'app-files': 'app/scripts/**/*.js',        
        'bower-components-path': 'bower_components'
      }
    });

    this.installDependencies({
      callback: this._injectDependencies.bind(this)
    });
  });

  this.pkg = require('../package.json');
  this.sourceRoot(path.join(__dirname, '../templates/common'));
};

util.inherits(Generator, yeoman.generators.Base);

Generator.prototype.welcome = function welcome() {
  if (!this.options['skip-welcome-message']) {
    this.log(yosay());
    this.log(
      chalk.magenta(
        'Out of the box I include PureWeb, Bootstrap and some AngularJS recommended modules.' +
        '\n'
      )
    );
  }
};

Generator.prototype.askForViewName = function askForViewName() {
  var cb = this.async();

  this.prompt([{
    type: 'input',
    name: 'pwView',
    message: 'Would you like to call your first PureWeb view?',
    default: 'FirstView'
  }], function (props) {
    this.viewName = props.pwView;        
    this.env.options.viewName = props.pwView;
    cb();
  }.bind(this));
};

Generator.prototype.askForBootstrap = function askForBootstrap() {
  var cb = this.async();

  this.prompt([{
    type: 'confirm',
    name: 'bootstrap',
    message: 'Would you like to include Bootstrap?',
    default: true
  }], function (props) {
    this.bootstrap = props.bootstrap;    
    cb();
  }.bind(this));
};

Generator.prototype.askForModules = function askForModules() {
  var cb = this.async();

  var prompts = [{
    type: 'checkbox',
    name: 'modules',
    message: 'Which modules would you like to include?',
    choices: [
    {
      value: 'animateModule',
      name: 'angular-animate.js',
      checked: true
    }, {
      value: 'cookiesModule',
      name: 'angular-cookies.js',
      checked: true
    }, {
      value: 'resourceModule',
      name: 'angular-resource.js',
      checked: true
    }, {
      value: 'routeModule',
      name: 'angular-route.js',
      checked: true
    }, {
      value: 'sanitizeModule',
      name: 'angular-sanitize.js',
      checked: true
    }, {
      value: 'touchModule',
      name: 'angular-touch.js',
      checked: true
    }
    ]
  }];

  this.prompt(prompts, function (props) {
    var hasMod = function (mod) { return props.modules.indexOf(mod) !== -1; };
    this.animateModule = hasMod('animateModule');
    this.cookiesModule = hasMod('cookiesModule');
    this.resourceModule = hasMod('resourceModule');
    this.routeModule = hasMod('routeModule');
    this.sanitizeModule = hasMod('sanitizeModule');
    this.touchModule = hasMod('touchModule');

    var angMods = [];

    if (this.animateModule) {
      angMods.push("'ngAnimate'");
    }

    if (this.cookiesModule) {
      angMods.push("'ngCookies'");
    }

    if (this.resourceModule) {
      angMods.push("'ngResource'");
    }

    if (this.routeModule) {
      angMods.push("'ngRoute'");
      this.env.options.ngRoute = true;
    }

    if (this.sanitizeModule) {
      angMods.push("'ngSanitize'");
    }

    if (this.touchModule) {
      angMods.push("'ngTouch'");
    }

    if (angMods.length) {
      this.env.options.angularDeps = '\n    ' + angMods.join(',\n    ') + '\n  ';
    }

    cb();
  }.bind(this));
};

Generator.prototype.readIndex = function readIndex() {
  this.indexFile = this.engine(this.read('app/index.html'), this);
};

Generator.prototype.bootstrapFiles = function bootstrapFiles() {
  var cssFile = 'styles/main.css';
  this.copy(
    path.join('app', cssFile),
    path.join(this.appPath, cssFile)
  );
};

Generator.prototype.appJs = function appJs() {
  this.indexFile = this.appendFiles({
    html: this.indexFile,
    fileType: 'js',
    optimizedPath: '/scripts/scripts.js',
    sourceFileList: ['/'+this.basename+'/app/scripts/app.js'],    
    searchPath: ['.tmp', this.appPath]
  });
};

Generator.prototype.createIndexHtml = function createIndexHtml() {
  this.indexFile = this.indexFile.replace(/&apos;/g, "'");
  this.write(path.join(this.appPath, 'index.html'), this.indexFile);
};

Generator.prototype.packageFiles = function packageFiles() {  
  this.template('root/_bower.json', 'bower.json');
  this.template('root/_bowerrc', '.bowerrc');
  this.template('root/_package.json', 'package.json');
  this.template('root/_Gruntfile.js', 'Gruntfile.js');
};

Generator.prototype._injectDependencies = function _injectDependencies() {
  wiredep({
    directory: 'bower_components',
    bowerJson: JSON.parse(fs.readFileSync('./bower.json')),
    ignorePath: new RegExp('^(' + this.appPath + '|..)/'),
    src: 'app/index.html',
    fileTypes: {
      html: {
        replace: {
          js: '<script src="/'+this.basename+'/{{filePath}}"></script>',
          css: '<link rel="stylesheet" href="/'+this.basename+'/{{filePath}}">'
        }
      }
    }
  });  
};

Generator.prototype.templateMainJs = function templateMainJs() {  
  this.mainFile = this.engine(this.read('app/views/main.html'), this);
  this.write(path.join(this.appPath, '/views/main.html'), this.mainFile);
};