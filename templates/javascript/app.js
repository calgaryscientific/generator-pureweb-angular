'use strict';

/**
 * @ngdoc overview
 * @name <%= scriptAppName %>
 * @description
 * # <%= scriptAppName %>
 *
 * Main module of the application.
 */
angular
  .module('<%= scriptAppName %>', [<%= angularModules %>])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: '/<%= basename %>/app/views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
