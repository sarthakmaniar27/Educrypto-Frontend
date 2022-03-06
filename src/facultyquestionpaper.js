FacultyQuestionPaper = {
    loading: false,
    contracts: {},
    QuestionPapers:[],
    ipfs:"",
    docHashMap:{},
    qpHash:"",
    facultyQuestionPaperCount:0,

  
    load: async () => {
      FacultyQuestionPaper.ipfs = window.IpfsHttpClient.create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })
      await FacultyQuestionPaper.loadWeb3()
      await FacultyQuestionPaper.loadAccount()
      await FacultyQuestionPaper.loadContract()
      await FacultyQuestionPaper.render()
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
      window.location.reload()
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

    submitQuestionPaper:async (event) => {

        const qpHash=FacultyQuestionPaper.qpHash
        const fid=localStorage.getItem("fid")
        const testName =$('#testname').val()
        const branch =$('#branch').val()
        const subject =$('#subject').val()
        // let url = `https://ipfs.infura.io/ipfs/${output.path}`;
        //   await FacultyQuestionPaper.exam.createQuestionPaper(studentUID, docHash, docType, { from: FacultyQuestionPaper.account})
        //https://ipfs.infura.io/ipfs/QmPZRNTxTWorK3RjYy2Fj1y3bmbkTGu4FTcU6V3Yx6A9ba
        //   window.location.reload()

      await FacultyQuestionPaper.createQuestionPaper(fid, testName, qpHash, branch, subject)
      console.log(fid, testName, qpHash, branch, subject)

    },

    render: async () => {

  
      // Render Account
      $('#account').html(FacultyQuestionPaper.account)
  
      // Render Document for given UID
      await FacultyQuestionPaper.renderDocuments()
      var tableString ="<table id='qptable' class='table table-striped'>";
      tableString +="<tr> <th>QP ID <th> Subject <th> Test Name <th> Branch <th> View </tr>";
    for(var i = 0; i < FacultyQuestionPaper.facultyQuestionPaperCount; i++) {
        var x=i+''
        console.log(x)
        var tr = "<tr>" ;
        tr += "<td>" + FacultyQuestionPaper.QuestionPapers[x].qpId  + "</td>";
        tr += "<td>" + FacultyQuestionPaper.QuestionPapers[x].subject + "</td>";  
        tr += "<td>" + FacultyQuestionPaper.QuestionPapers[x].testName + "</td>";
        tr += "<td>" + FacultyQuestionPaper.QuestionPapers[x].branch + "</td>";
        let url = `https://ipfs.infura.io/ipfs/${FacultyQuestionPaper.QuestionPapers[x].qpHash}`;
        tr += "<td> <a class='btn btn-primary' href="+url+ "> View</a> </td>";
        tr +="</tr>";


        tableString+=tr

        
    }
    tableString+="</table>";
    $('#qptableView').html(tableString)
},

    renderDocuments: async () => {

      // Load the total task count from the blockchain
      const questionPaperCount = await FacultyQuestionPaper.exam.questionPaperCount()
  
      // Render out each task with a new task template
      for (var i = 1; i <= questionPaperCount; i++) {
        // Fetch the task data from the blockchain
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
      console.log(FacultyQuestionPaper.QuestionPapers)
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
  

  
  }
  
  $(() => {
    $(window).load(() => {
      FacultyQuestionPaper.load()
    })
  })