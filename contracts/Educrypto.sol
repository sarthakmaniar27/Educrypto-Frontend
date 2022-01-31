pragma solidity ^0.5.0;

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

  // function toggleCompleted(uint _id) public {
  //   Document memory _task = documents[_id];
  //   _task.completed = !_task.completed;
  //   documents[_id] = _task;
  //   emit TaskCompleted(_id, _task.completed);
  // }

}