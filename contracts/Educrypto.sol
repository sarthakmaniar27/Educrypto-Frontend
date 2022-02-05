pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract Admission {
  uint public documentCount = 0;

  struct Document {
    uint docId;
    string studentUid;
    string docHash;
    string docType; 
  }

  mapping(uint => Document) public documents;

  constructor() public {
    createDocument("2018140036", "abc123", "aadhar card");
  }

  function createDocument(string memory _studentUid, string memory _docHash, string memory _docType) public {
    documentCount++;
    documents[documentCount] = Document(documentCount, _studentUid, _docHash, _docType);
    // emit TaskCreated(documentCount, _content, false);
  }

  // function getStudentDocuments(string memory _studentUid) public returns (uint[] memory, string[] memory, string[] memory, string[] memory){
  //   uint[] memory docId = new uint[](5);
  //   string[] memory studentUid = new string[](5);
  //   string[] memory docHash = new string[](5);
  //   string[] memory docType = new string[](5);

  //   uint counter = 0; 
  //   for(uint i=0; i<documentCount; i++) {
  //     if(keccak256(bytes(documents[i].studentUid)) == keccak256(bytes(_studentUid))) {
  //       studentUid[counter] = documents[i].studentUid;
  //       docHash[counter] = documents[i].docHash;
  //     }
  //     return (docId,studentUid,docHash,docType);
  //   }
  // }

  // function toggleCompleted(uint _id) public {
  //   Document memory _task = documents[_id];
  //   _task.completed = !_task.completed;
  //   documents[_id] = _task;
  //   emit TaskCompleted(_id, _task.completed);
  // }

}