'use strict';

/**
 * @ngdoc function
 * @name <%= scriptAppName %>.controller:<%= classedName %>Ctrl
 * @description
 * # <%= classedName %>Ctrl
 * Controller of the <%= scriptAppName %>
 */
angular.module('<%= scriptAppName %>')
  .controller('<%= classedName %>Ctrl', function ($scope, $tessera) {
    $scope.start = function(){  

    	//If you have malformed AngularJS code, this will protect
    	//against duplicate starts
        if (pureweb.getFramework().getClient().isConnected()) {
            window.console.log('Spurious restart');
            return;
        }     
		        
		var uri = location.href;
		$scope.client = pureweb.getClient();
		$scope.framework = pureweb.getFramework();

		//if the client was downloaded using an app URI then at this point location.href
		//will be the session URI to connect with. Otherwise this client was downloaded using a view
		//URI, so construct the app URI (without the client) to connect with.
		if (!pureweb.getClient().isaSessionUri(uri)) {            
			uri = location.protocol + '//' + location.host + '/pureweb/app?name=' + pureweb.getServiceAppName(uri);
		}else{
            uri = location.origin + location.pathname + "/" + location.search
        }
        
        //Initialie and setup the views
		$scope.PrimaryView = new pureweb.client.View({id: '<%= viewName %>', viewName: '<%= viewName %>'});       
        $scope.setDisconnectOnUnload(true);
		//register event listener for connected changed 
		pureweb.listen($scope.client, pureweb.client.WebClient.EventType.CONNECTED_CHANGED, $scope.onConnectedChanged);
		pureweb.listen($scope.framework, pureweb.client.Framework.EventType.IS_STATE_INITIALIZED, $scope.onIsStateInitializedChanged);

		//everything is setup and ready to go - connect
		pureweb.connect(uri);				
	};

	$scope.setDisconnectOnUnload = function(flag){
		if (flag){
			// setup the window.onbeforeunload callback to disconnect from the service application
			var f = function() {
				if (pureweb.getClient().isConnected()) {
					pureweb.getClient().disconnect(false);
				}
				return null;
			};
			window.onbeforeunload = f;
			window.onunload = f;
		}
		else
		{
			window.onbeforeunload = null;
			window.onunload = null;
		}
	};


	//Connected changed event handler
	$scope.onConnectedChanged = function(e) {
		if (e.target.isConnected()) {
			 $('#collab_button').prop('disabled', false);
			//register event listeners for connection stalled and session state failed events
			var client = pureweb.getClient();
			pureweb.listen(client, pureweb.client.WebClient.EventType.STALLED_CHANGED, $scope.onStalledChanged);
			pureweb.listen(client, pureweb.client.WebClient.EventType.SESSION_STATE_CHANGED, $scope.onSessionStateChanged); 
		}
	};

	//Stalled state changed event handler - logs a message indicating if the connection to the service
	//application has entered the stalled state, or whether it has recovered.
	$scope.onStalledChanged = function() {
		if (pureweb.getClient().isStalled()) {
			pureweb.getClient().logger.fine('Connection to the service application has stalled and may have been lost.');
		} else {
			pureweb.getClient().logger.fine('Connection to the service application has recovered.');
		}
	};

	//Session state changed event handler - checks for the failed state.
	$scope.onSessionStateChanged = function() {
		var sessionState = pureweb.getClient().getSessionState();
		if (sessionState === pureweb.client.SessionState.FAILED) {
			if ($scope.lastSessionState === pureweb.client.SessionState.CONNECTING) {
				$scope.generateMessage('Unable to connect to the service application.');
			} else {
				$scope.generateMessage('Connection to the service application has been lost.');
			  	if ($scope.ownerDisconnected) {        	     	
    	            $scope.generateMessage('The host has left, so your connection to the service application has been lost.');
	            }
			}

		}
		$scope.lastSessionState = sessionState;
	};


	$scope.onIsStateInitializedChanged = function(e) {
		var framework = pureweb.getFramework();		
		if (framework.isStateInitialized()) {
			pureweb.getFramework().getState().getStateManager().addChildChangedHandler('/', $scope.onStateChanged);
			$scope.AppState = pureweb.getFramework().getState().toString();
			$scope.$apply();
		}
	};

	$scope.onStateChanged = function(){
		$scope.AppState = pureweb.getFramework().getState().toString();
		$scope.$apply();
	};

	//Asynchronously create or revoke a share URL.
	$scope.generateShareUrl = function(){
		//Grab a local ref to the webclient (save some typing)
		var webClient = pureweb.getFramework().getClient();

		if (!webClient.isConnected()) {
			$scope.generateMessage('You must be connected to the PureWeb service app in order to generate a share URL');
			return;
		}

		//If we don't have a share URL...
		if (($scope.shareUrl === undefined) || ($scope.shareUrl === null)) {
			//Generate a share URL (on the service)        
			webClient.getSessionShareUrlAsync('Scientific', '', 1800000, '', function(getUrl, exception) {
				//Call back for share URL generation:
				//If we got a valid Share URL
				if ((getUrl !== null) && (getUrl !== undefined)) {
				
					//Set it locally
					$scope.shareUrl = getUrl;
					$scope.generateMessage(getUrl);
					$scope.$apply();				

				} else {
					$scope.generateMessage('An error occurred creating the share URL: ' + exception.description);
				}
			});
		} else {
			//If a share URL already exists, we just want to invalidate it
			webClient.invalidateSessionShareUrlAsync($scope.shareUrl, function(exception) {
				if ((exception !== undefined) && (exception !== null)){
					$scope.generateMessage('An error occurred invalidating the share URL: ' + exception);
				} else {
					$scope.shareUrl = null;					
					$scope.$apply();
				}
			});
		}
	};
	
	$scope.generateMessage = function(message){		
		$scope.message = message;
		$scope.$apply();
		$('#pureweb_message').modal('show');
	};

	$( document ).ready($scope.start);
	window.app = $scope;
});