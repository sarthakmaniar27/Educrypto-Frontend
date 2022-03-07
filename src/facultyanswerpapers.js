FacultyAnswerPapers = {
    loading: false,
    contracts: {},
    AnswerPapers:[],
    ipfs:"",
    docHashMap:{},
    qpHash:"",
    facultyAnswerPaperCount:0,
    AnswerPapers:[],

  
    load: async () => {
      FacultyAnswerPapers.ipfs = window.IpfsHttpClient.create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })
      await FacultyAnswerPapers.loadWeb3()
      await FacultyAnswerPapers.loadAccount()
      await FacultyAnswerPapers.loadContract()
    //   await FacultyAnswerPapers.render()
      await FacultyAnswerPapers.renderAnswerPapers()
    },
    

    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async () => {
      // const web3 = window.web3
      // await window.ethereum.enable()
      if (typeof web3 !== 'undefined') {
        FacultyAnswerPapers.web3Provider = web3.currentProvider
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
        FacultyAnswerPapers.web3Provider = web3.currentProvider
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
      FacultyAnswerPapers.account = accounts[0]
      console.log('account is loaded..',FacultyAnswerPapers.account)
    },

    loadContract: async () => {
      // Create a JavaScript version of the smart contract
      const exam = await $.getJSON('Exam.json')
      FacultyAnswerPapers.contracts.Exam = TruffleContract(exam)
      FacultyAnswerPapers.contracts.Exam.setProvider(FacultyAnswerPapers.web3Provider)
  
      // Hydrate the smart contract with values from the blockchain
      FacultyAnswerPapers.exam = await FacultyAnswerPapers.contracts.Exam.deployed()
    },



    

    renderAnswerPapers: async(testName,branch,subject)=>{
     const ftestName=localStorage.getItem("testName")
     const fbranch=localStorage.getItem("branch")
     const fsubject=localStorage.getItem("subject")

      const answerPaperCount = await FacultyAnswerPapers.exam.answerPaperCount()
  
      // Render out each task with a new task template
      for (var i = 1; i <= answerPaperCount; i++) {
        // Fetch the task data from the blockchain
        const ap = await FacultyAnswerPapers.exam.answerpapers(i)
        const apId = ap[0].toNumber()
        const studentUid = ap[1]
        const testName = ap[2]
        const apHash = ap[3]
        const branch = ap[4]
        const subject = ap[5]

        if(ftestName==testName && fbranch==branch && fsubject==subject){
          FacultyAnswerPapers.AnswerPapers.push({"apId":apId,"studentUid":studentUid,"testName":testName,"apHash":apHash,"branch":branch,"subject":subject})
            FacultyAnswerPapers.facultyAnswerPaperCount++
        }
      }
      console.log("Fetched answer papers")
      console.log(FacultyAnswerPapers.AnswerPapers)





      var tableString ="<table id='aptable' class='table table-striped'>";
      tableString +="<tr> <th>AP ID <th> Student UID <th> View Uploaded Answer Papers</tr>";
        for(var i = 0; i < FacultyAnswerPapers.facultyAnswerPaperCount; i++) {
        var x=i+''
        console.log(x)
        var tr = "<tr>" ;
        tr += "<td>" + FacultyAnswerPapers.AnswerPapers[x].apId  + "</td>";
        tr += "<td>" + FacultyAnswerPapers.AnswerPapers[x].studentUid + "</td>";  
        // tr += "<td>" + FacultyAnswerPapers.AnswerPapers[x].testName + "</td>";
        // tr += "<td>" + FacultyAnswerPapers.AnswerPapers[x].branch + "</td>";
        let url = `https://ipfs.infura.io/ipfs/${FacultyAnswerPapers.AnswerPapers[x].apHash}`;
        tr += "<td> <a class='btn btn-primary' href="+url+ "> View</a> </td>";
        // let testName=`${FacultyQuestionPaper.QuestionPapers[x].testName}`;
        // let branch=`${FacultyQuestionPaper.QuestionPapers[x].branch}`;
        // let subject=`${FacultyQuestionPaper.QuestionPapers[x].subject}`;
        // tr += "<td><button id='view_answer_papers' onClick=\"FacultyQuestionPaper.viewUploadedAnswerPapers('"+testName+"','"+branch+"','"+subject+"'\)\"; return false;>View Answer Papers</button> </td>";

        // tr += "<td> <a class='btn btn-primary' href="+url+ "> View Answer Papers</a> </td>";

        tr +="</tr>";


        tableString+=tr

        
    }
    tableString+="</table>";
    $('#aptableView').html(tableString)





    },

    // render: async () => {
    //   // Render Account
    //   $('#account').html(FacultyAnswerPapers.account)
  
    //   // Render Document for given UID
    //   await FacultyAnswerPapers.renderDocuments()
    //   var tableString ="<table id='qptable' class='table table-striped'>";
    //   tableString +="<tr> <th>QP ID <th> Subject <th> Test Name <th> Branch <th> View Question Paper <th> View Uploaded Answer Papers</tr>";
    // for(var i = 0; i < FacultyAnswerPapers.facultyAnswerPaperCount; i++) {
    //     var x=i+''
    //     console.log(x)
    //     var tr = "<tr>" ;
    //     tr += "<td>" + FacultyAnswerPapers.AnswerPapers[x].qpId  + "</td>";
    //     tr += "<td>" + FacultyAnswerPapers.AnswerPapers[x].subject + "</td>";  
    //     tr += "<td>" + FacultyAnswerPapers.AnswerPapers[x].testName + "</td>";
    //     tr += "<td>" + FacultyAnswerPapers.AnswerPapers[x].branch + "</td>";
    //     let url = `https://ipfs.infura.io/ipfs/${FacultyAnswerPapers.AnswerPapers[x].qpHash}`;
    //     tr += "<td> <a class='btn btn-primary' href="+url+ "> View</a> </td>";
    //     let testName=`${FacultyAnswerPapers.AnswerPapers[x].testName}`;
    //     let branch=`${FacultyAnswerPapers.AnswerPapers[x].branch}`;
    //     let subject=`${FacultyAnswerPapers.AnswerPapers[x].subject}`;
    //     tr += "<td><button id='view_answer_papers' onClick=\"FacultyAnswerPapers.viewUploadedAnswerPapers('"+testName+"','"+branch+"','"+subject+"'\)\"; return false;>View Answer Papers</button> </td>";

    //     // tr += "<td> <a class='btn btn-primary' href="+url+ "> View Answer Papers</a> </td>";

    //     tr +="</tr>";


    //     tableString+=tr

        
    // }
    // tableString+="</table>";
    // $('#qptableView').html(tableString)
    // },

    // renderDocuments: async () => {

    //   // Load the total task count from the blockchain
    //   const questionPaperCount = await FacultyAnswerPapers.exam.questionPaperCount()
  
    //   // Render out each task with a new task template
    //   for (var i = 1; i <= questionPaperCount; i++) {
    //     // Fetch the task data from the blockchain
    //     const qp = await FacultyAnswerPapers.exam.AnswerPapers(i)
    //     const qpId = qp[0].toNumber()
    //     const fid = qp[1]
    //     const testName = qp[2]
    //     const qpHash = qp[3]
    //     const branch = qp[4]
    //     const subject = qp[5]

    //     if(localStorage.getItem("fid")===fid){
    //       FacultyAnswerPapers.AnswerPapers.push({"qpId":qpId,"fid":fid,"testName":testName,"qpHash":qpHash,"branch":branch,"subject":subject})
    //         FacultyAnswerPapers.facultyAnswerPaperCount++
    //     }
    //   }
    //   console.log(FacultyAnswerPapers.AnswerPapers)
    // },

    setLoading: (boolean) => {
      FacultyAnswerPapers.loading = boolean
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
      FacultyAnswerPapers.load()
    })
  })