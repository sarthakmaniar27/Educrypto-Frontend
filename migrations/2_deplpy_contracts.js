const Admission = artifacts.require("Admission");
const Exam = artifacts.require("Exam");

module.exports = function(deployer) {
  deployer.deploy(Admission);
  deployer.deploy(Exam);
};
