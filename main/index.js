'use strict';
var path = require('path');
var util = require('util');
var yeoman = require('yeoman-generator');
var ScriptBase = require('../script-base.js');

var Generator = module.exports = function Generator() {
  ScriptBase.apply(this, arguments);
  this.basename = path.basename(process.cwd());
};

util.inherits(Generator, ScriptBase);

Generator.prototype.createAppFile = function createAppFile() {
  this.angularModules = this.env.options.angularDeps;
  this.appTemplate('app', 'scripts/app');
};
