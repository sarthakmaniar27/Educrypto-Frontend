const Admission = artifacts.require("Admission");

module.exports = function(deployer) {
  deployer.deploy(Admission);
};
