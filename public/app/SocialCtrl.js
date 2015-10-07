'use strict';
angular
  .module('FileSync')
  .controller('SocialCtrl', ['$scope', 'SocketIOService', function($scope, SocketIOService) {
    this.viewers = [];
    this.messages = [];
    this.message = '';

   this.sendMessage = function() {
      console.log(this.message);
      SocketIOService.messageUpdate(this.message);
    };

    function onViewersUpdated(viewers) {
      this.viewers = viewers;
      $scope.$apply();
    }
    function onMessageUpdated(messages) {
     this.messages = messages;
     $scope.$apply();
    }

    SocketIOService.onViewersUpdated(onViewersUpdated.bind(this));
    SocketIOService.onMessageUpdated(onMessageUpdated.bind(this));
  }]);
