var vicmanager = function () {
  var self = this;
  
  self.arousalValue = 0.5;
  self.affectValue = 0.5;
  self.step = 0.05;
  
  self.totalTime = 0;
  self.timeSeated = 0;
  
  self.getArousalValue = function () {
    return self.arousalValue;
  };
  
  self.getAffectValue = function () {
    return self.affectValue;
  };
  
  self.increaseAffectValue = function() {
    self.affectValue += self.step;
    if (self.affectValue > 1) {
      self.affectValue = 1;
    }
  };
  
  self.decreaseAffectValue = function() {
    self.affectValue -= self.step;
    if (self.affectValue <= 0) {
      self.affectValue = self.step;
    }
  };
  
  self.updateAffectValue = function (factor) {
    if (factor == 0) {
      self.affectValue += self.step;
    }
    else {
      self.affectValue -= factor * self.step;  
    }
    if (self.affectValue > 0.8) {
      self.affectValue = 0.8;
    }
    else if (self.affectValue < 0) {
      self.affectValue = 0;
    }
  };
  
  self.updateTotalTime = function () {
    self.totalTime++;
  };
  
  
};

module.exports = vicmanager;
