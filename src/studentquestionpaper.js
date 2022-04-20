StudentQuestionPaper = {
    loading: false,
    contracts: {},
    QuestionPapers:[],
    AnswerPapers:[],
    FacultyNotes:[],
    ipfs:"",
    docHashMap:{},
    qpHash:"",
    apHash:"",
    studentQuestionPaperCount:0,
    studentAnswerPaperCount:0,
    facultyNotesCount:0,
    Studentbranch:"",

  
    load: async () => {
      StudentQuestionPaper.ipfs = window.IpfsHttpClient.create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })
      await StudentQuestionPaper.loadWeb3()
      await StudentQuestionPaper.loadAccount()
      await StudentQuestionPaper.loadContract()
      await StudentQuestionPaper.renderAnswerPapers()
      await StudentQuestionPaper.render()
      await StudentQuestionPaper.renderFacultyNotes()

    },
    

    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async () => {
      // const web3 = window.web3
      // await window.ethereum.enable()
      if (typeof web3 !== 'undefined') {
        StudentQuestionPaper.web3Provider = web3.currentProvider
        web3 = new Web3(web3.currentProvider)
        console.log('web3 is loaded...',web3)
      } else {
        window.alert("Please connect to Metamask.")
      }
      // Modern dapp browsers...
      if (window.ethereum) {
        window.web3 = new Web3(ethereum)
        try {
          // Request account access if needed
          await ethereum.enable()
          // Acccounts now exposed
          web3.eth.sendTransaction({/* ... */})
        } catch (error) {
          // User denied account access...
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        StudentQuestionPaper.web3Provider = web3.currentProvider
        window.web3 = new Web3(web3.currentProvider)
        // Acccounts always exposed
        web3.eth.sendTransaction({/* ... */})
      }
      // Non-dapp browsers...
      else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }
    },
  
    loadAccount: async () => {
      // Set the current blockchain account
      const accounts = await web3.eth.getAccounts()
      StudentQuestionPaper.account = accounts[0]
      console.log('account is loaded..',StudentQuestionPaper.account)
    },

    loadContract: async () => {
      const exam = await $.getJSON('Exam.json')
      StudentQuestionPaper.contracts.Exam = TruffleContract(exam)
      StudentQuestionPaper.contracts.Exam.setProvider(StudentQuestionPaper.web3Provider)
      StudentQuestionPaper.exam = await StudentQuestionPaper.contracts.Exam.deployed()
    },

    
    captureFile :async (event) => {
      event.preventDefault()
      const file = event.target.files[0]
      console.log('File Captured...',file)
      const reader = new FileReader()
      await reader.readAsArrayBuffer(file)
      reader.onloadend = async () => {
          console.log("Window Buffer",reader.result)
          StudentQuestionPaper.buffer=new window.Buffer(reader.result);
          console.log(StudentQuestionPaper.buffer)
          console.log("IPFS code")
          const output = await StudentQuestionPaper.ipfs.add(StudentQuestionPaper.buffer, (error, result) => {
            if(error){
              console.error(error)
              return
            }
          })
          console.log("Output",output.path)
          StudentQuestionPaper.qpHash=output.path

      }

    },
    
    renderAnswerPapers: async () => {
        $('#account').html(StudentQuestionPaper.account)
        const AnswerPaperCount = await StudentQuestionPaper.exam.answerPaperCount()
        const uid=localStorage.getItem("studentUID")
        for (var i = 1; i <= AnswerPaperCount; i++) {
            const ap = await StudentQuestionPaper.exam.answerpapers(i)
            const apId = ap[0].toNumber()
            const studentUid = ap[1]
            const testName = ap[2]
            const apHash = ap[3]
            const branch = ap[4]
            const subject = ap[5]
    
            if(studentUid===uid){
              StudentQuestionPaper.AnswerPapers.push({"apId":apId,"studentUid":studentUid,"testName":testName,"apHash":apHash,"branch":branch,"subject":subject})
              StudentQuestionPaper.studentAnswerPaperCount++;
              console.log("Answer Paper pushed",StudentQuestionPaper.studentAnswerPaperCount)

            }
          }
          console.log("Answer Papers submitted by students")
          console.log(StudentQuestionPaper.AnswerPapers)
    },

    validateStudentAnswerPaper: (qptestName,qpbranch,qpsubject) => {
        for (var i = 0; i < StudentQuestionPaper.studentAnswerPaperCount; i++) {
            const x=i+''
            const apId = StudentQuestionPaper.AnswerPapers[x].apId
            const studentUid = StudentQuestionPaper.AnswerPapers[x].studentUid
            const testName = StudentQuestionPaper.AnswerPapers[x].testName
            const apHash = StudentQuestionPaper.AnswerPapers[x].apHash
            const branch = StudentQuestionPaper.AnswerPapers[x].branch
            const subject = StudentQuestionPaper.AnswerPapers[x].subject

            if(qptestName==testName && qpbranch==branch && qpsubject==subject){
                StudentQuestionPaper.apHash=apHash
                return true
            }
    }
    return false

},

    render: async () => {
      // Render Account
      $('#account').html(StudentQuestionPaper.account)
  
      // Render Document for given UID
      await StudentQuestionPaper.renderDocuments()
      var tableString ="<table id='qptable' class='table table-striped'>";
      tableString +="<tr> <th>QP ID <th> Subject <th> Test Name <th> Branch <th> View Question Paper <th> Upload Answer Paper </tr>";
        for(var i = 0; i < StudentQuestionPaper.studentQuestionPaperCount; i++) {
            var x=i+''
            var tr = "<tr>" ;
            tr += "<td>" + StudentQuestionPaper.QuestionPapers[x].qpId  + "</td>";
            tr += "<td>" + StudentQuestionPaper.QuestionPapers[x].subject + "</td>";  
            tr += "<td>" + StudentQuestionPaper.QuestionPapers[x].testName + "</td>";
            tr += "<td>" + StudentQuestionPaper.QuestionPapers[x].branch + "</td>";
            let url = `https://ipfs.infura.io/ipfs/${StudentQuestionPaper.QuestionPapers[x].qpHash}`;
            let testName=`${StudentQuestionPaper.QuestionPapers[x].testName}`;
            let branch=`${StudentQuestionPaper.QuestionPapers[x].branch}`;
            let subject=`${StudentQuestionPaper.QuestionPapers[x].subject}`;
            tr += "<td> <a class='btn btn-primary' href="+url+ "> View Question Paper</a> </td>";

            if(StudentQuestionPaper.validateStudentAnswerPaper(testName,branch,subject)){
                let apUrl=`https://ipfs.infura.io/ipfs/${StudentQuestionPaper.apHash}`; 
                tr += "<td> <a class='btn btn-primary' href="+apUrl+ "> View Answer Paper</a> </td>";
            }
            else{
                tr += "<td><input type='file' id='answer_paper_upload' onChange=\"StudentAnswerPaper.captureFile(event,'"+testName+"','"+branch+"','"+subject+"'\)\"; return false;/> </td>";
            }


            tr +="</tr>";
            tableString+=tr    
    }
    tableString+="</table>";
    $('#qptableView').html(tableString)
},

    renderDocuments: async () => {
      const questionPaperCount = await StudentQuestionPaper.exam.questionPaperCount()
      const uid=localStorage.getItem("studentUID")
      const Studentbranch= await axios.get("http://127.0.0.1:8000/getstudentbranch/",{
          params:{
          uid:uid
          }
      })
      StudentQuestionPaper.Studentbranch=Studentbranch
      for (var i = 1; i <= questionPaperCount; i++) {
        const qp = await StudentQuestionPaper.exam.questionpapers(i)
        const qpId = qp[0].toNumber()
        const fid = qp[1]
        const testName = qp[2]
        const qpHash = qp[3]
        const branch = qp[4]
        const subject = qp[5]

        if(Studentbranch.data.branch===branch){
          StudentQuestionPaper.QuestionPapers.push({"qpId":qpId,"fid":fid,"testName":testName,"qpHash":qpHash,"branch":branch,"subject":subject})
            StudentQuestionPaper.studentQuestionPaperCount++
        }
      }
      console.log(StudentQuestionPaper.QuestionPapers)
    },

    renderFacultyNotes: async () => {
      const notesCount = await StudentQuestionPaper.exam.notesCount()
      for (var i = 1; i <= notesCount; i++) {
        const notes = await StudentQuestionPaper.exam.facultynotes(i)
        const notesId = notes[0].toNumber()
        const fid = notes[1]
        const notesHash = notes[2]
        const testName = notes[3]
        const branch = notes[4]
        const subject = notes[5]
        let studentBranch=StudentQuestionPaper.Studentbranch.data.branch
        if(studentBranch===branch){
          StudentQuestionPaper.FacultyNotes.push({"notesId":notesId,"fid":fid,"testName":testName,"notesHash":notesHash,"branch":branch,"subject":subject})
          StudentQuestionPaper.facultyNotesCount++
        }
      }
      console.log('Faculty Notes Rendered')
      console.log(StudentQuestionPaper.FacultyNotes)



      var tableString ="<table id='qptable' class='table table-striped'>";
      tableString +="<tr> <th>Notes ID <th> Subject <th> Notes Name <th> Branch <th> View Notes </tr>";
      for(var i = 0; i < StudentQuestionPaper.facultyNotesCount; i++) {
        var x=i+''
        console.log(x)
        var tr = "<tr>" ;
        tr += "<td>" + StudentQuestionPaper.FacultyNotes[x].notesId  + "</td>";
        tr += "<td>" + StudentQuestionPaper.FacultyNotes[x].subject + "</td>";  
        tr += "<td>" + StudentQuestionPaper.FacultyNotes[x].testName + "</td>";
        tr += "<td>" + StudentQuestionPaper.FacultyNotes[x].branch + "</td>";
        let url = `https://ipfs.infura.io/ipfs/${StudentQuestionPaper.FacultyNotes[x].notesHash}`;
        tr += "<td> <a class='btn btn-primary' href="+url+ " download> View</a> </td>";
        let testName=`${StudentQuestionPaper.FacultyNotes[x].testName}`;
        let branch=`${StudentQuestionPaper.FacultyNotes[x].branch}`;
        let subject=`${StudentQuestionPaper.FacultyNotes[x].subject}`;
        tr +="</tr>";
        tableString+=tr        
    }
    tableString+="</table>";
    $('#notestableView').html(tableString)
    },

    setLoading: (boolean) => {
      StudentQuestionPaper.loading = boolean
      const loader = $('#loader')
      const content = $('#content')
      if (boolean) {
        loader.show()
        content.hide()
      } else {
        loader.hide()
        content.show()
      }
    },
  

  
  }
  
  $(() => {
    $(window).load(() => {
      StudentQuestionPaper.load()
    })
  })