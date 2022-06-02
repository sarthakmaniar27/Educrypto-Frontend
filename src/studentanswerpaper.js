StudentAnswerPaper = {
    loading: false,
    contracts: {},
    AnswerPapers:[],
    ipfs:"",
    docHashMap:{},
    apHash:"",
    studentAnswerPaperCount:0,

  
    load: async () => {
      StudentAnswerPaper.ipfs = window.IpfsHttpClient.create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })
      await StudentAnswerPaper.loadWeb3()
      await StudentAnswerPaper.loadAccount()
      await StudentAnswerPaper.loadContract()
    //   await StudentAnswerPaper.renderAnswerPapers()
    },
    

    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async () => {
      // const web3 = window.web3
      // await window.ethereum.enable()
      if (typeof web3 !== 'undefined') {
        StudentAnswerPaper.web3Provider = web3.currentProvider
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
        StudentAnswerPaper.web3Provider = web3.currentProvider
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
      StudentAnswerPaper.account = accounts[0]
      console.log('account is loaded..',StudentAnswerPaper.account)
    },

    loadContract: async () => {
      // Create a JavaScript version of the smart contract
      const exam = await $.getJSON('Exam.json')
      StudentAnswerPaper.contracts.Exam = TruffleContract(exam)
      StudentAnswerPaper.contracts.Exam.setProvider(StudentAnswerPaper.web3Provider)
  
      // Hydrate the smart contract with values from the blockchain
      StudentAnswerPaper.exam = await StudentAnswerPaper.contracts.Exam.deployed()
    },

    
    captureFile :async (event,testName,branch,subject) => {
        console.log("In capture file")
        console.log(event)
      event.preventDefault()
      const file = event.target.files[0]
      console.log('File Captured...',file)
      const reader = new FileReader()
      await reader.readAsArrayBuffer(file)
      reader.onloadend = async () => {
          console.log("Window Buffer",reader.result)
          StudentAnswerPaper.buffer=new window.Buffer(reader.result);
          console.log(StudentAnswerPaper.buffer)
          console.log("IPFS code")
          const output = await StudentAnswerPaper.ipfs.add(StudentAnswerPaper.buffer, (error, result) => {
            if(error){
              console.error(error)
              return
            }
          })
          console.log("Output",output.path)
          StudentAnswerPaper.apHash=output.path
          const studentId=localStorage.getItem("studentUID")
          await StudentAnswerPaper.exam.createAnswerPaper(studentId, testName, StudentAnswerPaper.apHash, branch,subject, { from: StudentAnswerPaper.account})
          window.location.reload()

      }

    },

//     renderAnswerPapers: async () => {
//       // Render Account
//       $('#account').html(StudentAnswerPaper.account)
  
//       // Render Document for given UID
//       await StudentAnswerPaper.renderDocuments()
//       var tableString ="<table id='qptable' class='table table-striped'>";
//       tableString +="<tr> <th>QP ID <th> Subject <th> Test Name <th> Branch <th> View <th> Upload Question Paper </tr>";
//         for(var i = 0; i < StudentAnswerPaper.studentQuestionPaperCount; i++) {
//             var x=i+''
//             console.log(x)
//             var tr = "<tr>" ;
//             tr += "<td>" + StudentAnswerPaper.AnswerPapers[x].qpId  + "</td>";
//             tr += "<td>" + StudentAnswerPaper.AnswerPapers[x].subject + "</td>";  
//             tr += "<td>" + StudentAnswerPaper.AnswerPapers[x].testName + "</td>";
//             tr += "<td>" + StudentAnswerPaper.AnswerPapers[x].branch + "</td>";
//             let url = `https://ipfs.infura.io/ipfs/${StudentAnswerPaper.AnswerPapers[x].apHash}`;
//             tr += "<td> <a class='btn btn-primary' href="+url+ "> View</a> </td>";
//             tr += "<td><input type='file' id='answer_paper_upload' onChange='StudentAnswerPaper.captureFile(event); return false;' class='btn' /> </td>";
//             tr +="</tr>";
//             tableString+=tr    
//     }
//     tableString+="</table>";
//     $('#qptableView').html(tableString)
// },

//     renderDocuments: async () => {

//       // Load the total task count from the blockchain
//       const questionPaperCount = await StudentAnswerPaper.exam.questionPaperCount()
//       const uid=localStorage.getItem("studentUID")
//       const Studentbranch= await axios.get("http://127.0.0.1:8000/getstudentbranch/",{
//           params:{
//           uid:uid
//           }
//       })
//       console.log(Studentbranch)
//       // Render out each task with a new task template
//       for (var i = 1; i <= questionPaperCount; i++) {
//         // Fetch the task data from the blockchain
//         const qp = await StudentAnswerPaper.exam.AnswerPapers(i)
//         const qpId = qp[0].toNumber()
//         const fid = qp[1]
//         const testName = qp[2]
//         const apHash = qp[3]
//         const branch = qp[4]
//         const subject = qp[5]

//         if(Studentbranch.data.branch===branch){
//           StudentAnswerPaper.AnswerPapers.push({"qpId":qpId,"fid":fid,"testName":testName,"apHash":apHash,"branch":branch,"subject":subject})
//             StudentAnswerPaper.studentAnswerPaperCount++
//         }
//       }
//       console.log(StudentAnswerPaper.AnswerPapers)
//     },

}
  
  $(() => {
    $(window).load(() => {
      StudentAnswerPaper.load()
    })
  })