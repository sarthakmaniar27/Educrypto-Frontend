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
  // mapping(uint => Document) public studentDocuments;
  constructor() public {
    createDocument("2018140036", "abc123", "aadhar card");
  }

  function createDocument(string memory _studentUid, string memory _docHash, string memory _docType) public {
    documentCount++;
    documents[documentCount] = Document(documentCount, _studentUid, _docHash, _docType);
    // emit TaskCreated(documentCount, _content, false);
  }
}


contract Exam {
  uint public questionPaperCount = 0;
  uint public answerPaperCount = 0;


  struct QuestionPaper {
    uint qpId;
    string fid;
    string testName;
    string qpHash;
    string branch;
    string subject;
  }

  struct AnswerPaper {
    uint apId;
    string studentUid;
    string testName;
    string apHash;
    string branch;
    string subject;
  }


  mapping(uint => QuestionPaper) public questionpapers;
  mapping(uint => AnswerPaper) public answerpapers;

 

  function createQuestionPaper(string memory _fid, string memory _testName, string memory _qpHash, string memory _branch, string memory _subject) public {
    questionPaperCount++;
    questionpapers[questionPaperCount] = QuestionPaper(questionPaperCount, _fid, _testName, _qpHash, _branch,_subject);
  }

  
  function createAnswerPaper(string memory _studentUid, string memory _testName, string memory _apHash, string memory _branch, string memory _subject) public {
    answerPaperCount++;
    answerpapers[answerPaperCount] = AnswerPaper(answerPaperCount, _studentUid, _testName, _apHash, _branch,_subject);
  }
}