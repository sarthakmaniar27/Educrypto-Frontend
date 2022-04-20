FacultyQuestionPaper = {
    loading: false,
    contracts: {},
    QuestionPapers:[],
    FacultyNotes:[],
    ipfs:"",
    docHashMap:{},
    qpHash:"",
    reportHash:"",
    facultyQuestionPaperCount:0,
    facultyAnswerPaperCount:0,
    facultyNotesCount:0,
    AnswerPapers:[],
    notesHash:"",

  
    load: async () => {
      FacultyQuestionPaper.ipfs = window.IpfsHttpClient.create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })
      await FacultyQuestionPaper.loadWeb3()
      await FacultyQuestionPaper.loadAccount()
      await FacultyQuestionPaper.loadContract()
      await FacultyQuestionPaper.render()
      await FacultyQuestionPaper.renderFacultyNotes()
    },
    

    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async () => {
      // const web3 = window.web3
      // await window.ethereum.enable()
      if (typeof web3 !== 'undefined') {
        FacultyQuestionPaper.web3Provider = web3.currentProvider
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
        FacultyQuestionPaper.web3Provider = web3.currentProvider
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
      FacultyQuestionPaper.account = accounts[0]
      console.log('account is loaded..',FacultyQuestionPaper.account)
    },

    loadContract: async () => {
      // Create a JavaScript version of the smart contract
      const exam = await $.getJSON('Exam.json')
      FacultyQuestionPaper.contracts.Exam = TruffleContract(exam)
      FacultyQuestionPaper.contracts.Exam.setProvider(FacultyQuestionPaper.web3Provider)
  
      // Hydrate the smart contract with values from the blockchain
      FacultyQuestionPaper.exam = await FacultyQuestionPaper.contracts.Exam.deployed()
    },

    createQuestionPaper: async (fid, testName, qpHash, branch, subject) => {
      console.log("Faculty UID from Browser",fid)
      await FacultyQuestionPaper.exam.createQuestionPaper(fid, testName, qpHash, branch,subject, { from: FacultyQuestionPaper.account})
      window.location.href="http://localhost:3000/facultydashboard.html"
    },

    captureFile :async (event) => {
      event.preventDefault()
      const file = event.target.files[0]
      console.log('File Captured...',file)
      const reader = new FileReader()
      await reader.readAsArrayBuffer(file)
      reader.onloadend = async () => {
          console.log("Window Buffer",reader.result)
          FacultyQuestionPaper.buffer=new window.Buffer(reader.result);
          console.log(FacultyQuestionPaper.buffer)
          console.log("IPFS code")
          const output = await FacultyQuestionPaper.ipfs.add(FacultyQuestionPaper.buffer, (error, result) => {
            if(error){
              console.error(error)
              return
            }
          })
          console.log("Output",output.path)
          FacultyQuestionPaper.qpHash=output.path
      }

    },


    captureNotesFile :async (event) => {
      event.preventDefault()
      const file = event.target.files[0]
      console.log('File Captured...',file)
      const reader = new FileReader()
      await reader.readAsArrayBuffer(file)
      reader.onloadend = async () => {
          console.log("Window Buffer",reader.result)
          FacultyQuestionPaper.buffer=new window.Buffer(reader.result);
          console.log(FacultyQuestionPaper.buffer)
          console.log("IPFS code")
          const output = await FacultyQuestionPaper.ipfs.add(FacultyQuestionPaper.buffer, (error, result) => {
            if(error){
              console.error(error)
              return
            }
          })
          console.log("Output",output.path)
          FacultyQuestionPaper.notesHash=output.path
      }
    },

    uploadFacultyNotes:async (event) => {
      const notesHash=FacultyQuestionPaper.notesHash
      const fid=localStorage.getItem("fid")
      const notesname =$('#notesname').val()
      const branch =$('#branch').val()
      const subject =$('#subject').val()
      console.log(fid, notesHash, notesname, branch,subject)
      await FacultyQuestionPaper.exam.createFacultyNotes(fid, notesHash, notesname, branch,subject, { from: FacultyQuestionPaper.account})
      window.location.href="http://localhost:3000/facultydashboard.html"
  },

    submitQuestionPaper:async (event) => {
        const qpHash=FacultyQuestionPaper.qpHash
        const fid=localStorage.getItem("fid")
        const testName =$('#testname').val()
        const branch =$('#branch').val()
        const subject =$('#subject').val()
      await FacultyQuestionPaper.createQuestionPaper(fid, testName, qpHash, branch, subject)
      console.log(fid, testName, qpHash, branch, subject)
    },

    viewUploadedAnswerPapers: async(testName,branch,subject)=>{
      console.log(testName,branch,subject)
      localStorage.setItem("testName",testName)
      localStorage.setItem("branch",branch)
      localStorage.setItem("subject",subject) 
      window.location.href="http://localhost:3000/facultyanswerpapers.html"
    },

    generateReport: async(testName,branch,subject)=>{
      const res= await axios.get("http://127.0.0.1:8000/createtestreport/",{
        params:{
          testName:testName,
          branch:branch,
          subject:subject
        }
      })
      console.log(res)

    },

    render: async () => {
      $('#account').html(FacultyQuestionPaper.account)
      await FacultyQuestionPaper.renderDocuments()
      var tableString ="<table id='qptable' class='table table-striped'>";
      tableString +="<tr> <th>QP ID <th> Subject <th> Test Name <th> Branch <th> View Question Paper <th> View Uploaded Answer Papers <th> Generate Report</tr>";
      for(var i = 0; i < FacultyQuestionPaper.facultyQuestionPaperCount; i++) {
        var x=i+''
        console.log(x)
        var tr = "<tr>" ;
        tr += "<td>" + FacultyQuestionPaper.QuestionPapers[x].qpId  + "</td>";
        tr += "<td>" + FacultyQuestionPaper.QuestionPapers[x].subject + "</td>";  
        tr += "<td>" + FacultyQuestionPaper.QuestionPapers[x].testName + "</td>";
        tr += "<td>" + FacultyQuestionPaper.QuestionPapers[x].branch + "</td>";

        // https://ipfs.infura.io/ipfs/Qmdko4xPgkjXNe5hxuPnhWxBirWRwGK2n2w2gvLmx1znhF
        let url = `https://ipfs.infura.io/ipfs/${FacultyQuestionPaper.QuestionPapers[x].qpHash}`;
        tr += "<td> <a class='btn btn-primary' href="+url+ " download> View</a> </td>";
        let testName=`${FacultyQuestionPaper.QuestionPapers[x].testName}`;
        let branch=`${FacultyQuestionPaper.QuestionPapers[x].branch}`;
        let subject=`${FacultyQuestionPaper.QuestionPapers[x].subject}`;
        tr += "<td><button class='btn btn-primary' id='view_answer_papers' onClick=\"FacultyQuestionPaper.viewUploadedAnswerPapers('"+testName+"','"+branch+"','"+subject+"'\)\"; return false;>View Answer Papers</button> </td>";
        tr += "<td><button class='btn btn-primary' id='view_answer_papers' onClick=\"FacultyQuestionPaper.generateReport('"+testName+"','"+branch+"','"+subject+"'\)\"; return false;>Generate Report</button> </td>";
        tr +="</tr>";
        tableString+=tr        
    }
    tableString+="</table>";
    $('#qptableView').html(tableString)
},

    renderDocuments: async () => {
      var startTime = performance.now()
      const questionPaperCount = await FacultyQuestionPaper.exam.questionPaperCount()
      for (var i = 1; i <= questionPaperCount; i++) {
        const qp = await FacultyQuestionPaper.exam.questionpapers(i)
        const qpId = qp[0].toNumber()
        const fid = qp[1]
        const testName = qp[2]
        const qpHash = qp[3]
        const branch = qp[4]
        const subject = qp[5]

        if(localStorage.getItem("fid")===fid){
          FacultyQuestionPaper.QuestionPapers.push({"qpId":qpId,"fid":fid,"testName":testName,"qpHash":qpHash,"branch":branch,"subject":subject})
            FacultyQuestionPaper.facultyQuestionPaperCount++
        }
      }
      var endTime = performance.now()
      console.log(`Call to render question papers from Blockchain took ${endTime - startTime} milliseconds`)
      console.log(FacultyQuestionPaper.QuestionPapers)
    },

    renderFacultyNotes: async () => {
      const notesCount = await FacultyQuestionPaper.exam.notesCount()
      for (var i = 1; i <= notesCount; i++) {
        const notes = await FacultyQuestionPaper.exam.facultynotes(i)
        const notesId = notes[0].toNumber()
        const fid = notes[1]
        const notesHash = notes[2]
        const testName = notes[3]
        const branch = notes[4]
        const subject = notes[5]

        if(localStorage.getItem("fid")===fid){
          FacultyQuestionPaper.FacultyNotes.push({"notesId":notesId,"fid":fid,"testName":testName,"notesHash":notesHash,"branch":branch,"subject":subject})
            FacultyQuestionPaper.facultyNotesCount++
        }
      }
      console.log('Faculty Notes Rendered')
      console.log(FacultyQuestionPaper.FacultyNotes)



      var tableString ="<table id='qptable' class='table table-striped'>";
      tableString +="<tr> <th>Notes ID <th> Subject <th> Notes Name <th> Branch <th> View Notes </tr>";
      for(var i = 0; i < FacultyQuestionPaper.facultyNotesCount; i++) {
        var x=i+''
        console.log(x)
        var tr = "<tr>" ;
        tr += "<td>" + FacultyQuestionPaper.FacultyNotes[x].notesId  + "</td>";
        tr += "<td>" + FacultyQuestionPaper.FacultyNotes[x].subject + "</td>";  
        tr += "<td>" + FacultyQuestionPaper.FacultyNotes[x].testName + "</td>";
        tr += "<td>" + FacultyQuestionPaper.FacultyNotes[x].branch + "</td>";
        let url = `https://ipfs.infura.io/ipfs/${FacultyQuestionPaper.FacultyNotes[x].notesHash}`;
        tr += "<td> <a class='btn btn-primary' href="+url+ " download> View</a> </td>";
        let testName=`${FacultyQuestionPaper.FacultyNotes[x].testName}`;
        let branch=`${FacultyQuestionPaper.FacultyNotes[x].branch}`;
        let subject=`${FacultyQuestionPaper.FacultyNotes[x].subject}`;
        tr +="</tr>";
        tableString+=tr        
    }
    tableString+="</table>";
    $('#notestableView').html(tableString)
    },

    setLoading: (boolean) => {
      FacultyQuestionPaper.loading = boolean
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

    generateSubjectReport:  async () => {
      const branch=$('#branch').val()
      const subject=$('#subject').val()
      console.log(branch,subject)
      // localStorage.setItem("fid",fid)
      const res= await axios.get("http://127.0.0.1:8000/createsubjectreport/",{
          params:{
          branch:branch,
          subject:subject
          }
      })
      reportHash=res.data.res
      console.log(res.data.res)
      
       if(res){             
            await FacultyQuestionPaper.exam.createMarksReport(reportHash,"ALL",branch,subject, { from: FacultyQuestionPaper.account})
            window.alert("Subject Report has been sucessfully generated")
            let url = `https://ipfs.infura.io/ipfs/${reportHash}`;
            window.location.href = url       
       }
     


  },

  generateClassReport:  async () => {
    const branch=$('#branch').val()
    console.log(branch)
    // localStorage.setItem("fid",fid)
    const res= await axios.get("http://127.0.0.1:8000/createclassreport/",{
        params:{
        branch:branch
        }
    })
    reportHash=res.data.res
    console.log(res.data.res)
    
     if(res){             
          await FacultyQuestionPaper.exam.createMarksReport(reportHash,"ALL",branch,"ALL", { from: FacultyQuestionPaper.account})
          window.alert("Subject Report has been sucessfully generated")
          let url = `https://ipfs.infura.io/ipfs/${reportHash}`;
          window.location.href = url       
     }
   


},
  

  
  }
  
  $(() => {
    $(window).load(() => {
      FacultyQuestionPaper.load()
    })
  })