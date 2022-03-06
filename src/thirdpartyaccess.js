ThirdParty = {
    loading: false,
    contracts: {},
    StudentDocJson:[],
    ipfs:"",
    docHashMap:{},

  
    load: async () => {
      ThirdParty.ipfs = window.IpfsHttpClient.create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })
      await ThirdParty.loadWeb3()
      await ThirdParty.loadAccount()
      await ThirdParty.loadContract()
      await ThirdParty.render()
    },
    

    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async () => {
      // const web3 = window.web3
      // await window.ethereum.enable()
      if (typeof web3 !== 'undefined') {
        ThirdParty.web3Provider = web3.currentProvider
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
        ThirdParty.web3Provider = web3.currentProvider
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
      ThirdParty.account = accounts[0]
      console.log('account is loaded..',ThirdParty.account)
    },
    loadContract: async () => {
      // Create a JavaScript version of the smart contract
      const admission = await $.getJSON('Admission.json')
      ThirdParty.contracts.Admission = TruffleContract(admission)
      ThirdParty.contracts.Admission.setProvider(ThirdParty.web3Provider)
  
      // Hydrate the smart contract with values from the blockchain
      ThirdParty.admission = await ThirdParty.contracts.Admission.deployed()
      console.log(ThirdParty.admission)
    },

    viewDocument: async (docHash) => {
      console.log(docHash)
      let url = `https://ipfs.infura.io/ipfs/${docHash}`;
      window.location.href=url

    },
    render: async () => {

  
      // Render Account
      $('#account').html(ThirdParty.account)


      // Update loading state
    },

    renderDocuments: async (uid,doc_type) => {
      // Load the total task count from the blockchain
      const documentCount = await ThirdParty.admission.documentCount()  
      // Render out each task with a new task template
      for (var i = 1; i <= documentCount; i++) {
        // Fetch the task data from the blockchain
        const document = await ThirdParty.admission.documents(i)
        const docId = document[0].toNumber()
        const studentUid = document[1]
        const docHash = document[2]
        const docType = document[3]
        if(studentUid===uid && docType===doc_type){
        ThirdParty.StudentDocJson.push({"docId":docId,"studentUid":studentUid,"docHash":docHash,"docType":docType})
        console.log(ThirdParty.StudentDocJson)
        ThirdParty.viewDocument(docHash)



        }
      }
    },
    setLoading: (boolean) => {
      ThirdParty.loading = boolean
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

    validatethirdparty: async () => {
        const third_party_name=$('#third_party_name').val()
        const atp=$('#atp').val()
        console.log(third_party_name,atp)
        const res= await axios.get("http://127.0.0.1:8000/validatethirdparty/",{
            params:{
                third_party_name:third_party_name,
                atp:atp
            }
          })
        
        console.log(res)
        if(res.data.res=="Valid"){
            //  fetch document and display
            ThirdParty.renderDocuments(res.data.student_uid,res.data.doc_type)

        }
    },
  

  
  }
  
  $(() => {
    $(window).load(() => {
      ThirdParty.load()

    })
  })