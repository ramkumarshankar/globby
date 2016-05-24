// Module to manage our clients

var clientManager = function () {
   var self = this;

   self.clientList = [];

   self.lastClientID = 0;

   self.addNewClient = function(socket_id) {
     var client_uid = self.lastClientID;
     self.clientList.push({
       uid: self.lastClientID,
       socketID: socket_id,
     });
     self.lastClientID++;
     return client_uid;
   };
   
   self.selectRandomClientSocketID = function () {
     var numClients = self.clientList.length;
     var selectedClient = Math.floor(Math.random() * (numClients));
     return self.clientList[selectedClient].socketID;
   };

   self.getClientIdxByID = function (clientID) {
     var idx = -1;
     for (var i = 0; i < self.clientList.length; i++) {
       if (clientID == self.clientList[i].uid) {
         idx = i;
         return idx;
       }
     }
     return idx;
   };

   self.getClientIdByIdx = function (index) {
     return self.clientList[index].uid;
   };

   self.getClientIdxBySocketID = function (socket_id) {
     var idx = -1;
     for (var i = 0; i < self.clientList.length; i++) {
       if (socket_id == self.clientList[i].socketID) {
         idx = i;
         return idx;
       }
     }
     return idx;
   };

   self.getClientSocketIDbyID = function (clientID) {
     var socketID = -1;
     for (var i = 0; i < self.clientList.length; i++) {
       if (clientID == self.clientList[i].uid) {
         socketID = self.clientList[i].socketID;
         return socketID;
       }
     }
     return socketID;
   };

   self.removeClientByIdx = function (index) {
     self.clientList.splice(index, 1);
   };

   self.clearclientList = function() {
     self.clientList = [];
     self.lastClientID = 0;
   };

};

module.exports = clientManager;
