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
  
  self.increaseAffectValue = function() {
    self.affectValue *= 1.1;
    if (self.affectValue > 1) {
      self.affectValue = 1;
    }
  };
  
  self.decreaseAffectValue = function() {
    self.affectValue *= 0.9;
    if (self.affectValue == 1) {
      self.affectValue = 1;
    }
  };
  
  
};

module.exports = vicmanager;
