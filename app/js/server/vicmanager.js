var vicmanager = function () {
  var self = this;
  
  self.arousalValue = 0.5;
  self.affectValue = 0.5;
  
  self.getArousalValue = function () {
    return self.arousalValue;
  };
  
  self.getAffectValue = function () {
    return self.affectValue;
  };
  
  
};

module.exports = vicmanager;
