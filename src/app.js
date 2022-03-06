App = {
    loading: false,
    contracts: {},
    StudentDocJson:[],
    ipfs:"",
    docHashMap:{},

  
    load: async () => {
      App.ipfs = window.IpfsHttpClient.create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })
      await App.loadWeb3()
      await App.loadAccount()
      await App.loadContract()
      await App.render()
    },
    

    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async () => {
      // const web3 = window.web3
      // await window.ethereum.enable()
      if (typeof web3 !== 'undefined') {
        App.web3Provider = web3.currentProvider
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
        App.web3Provider = web3.currentProvider
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
      App.account = accounts[0]
      console.log('account is loaded..',App.account)
    },

    loadContract: async () => {
      // Create a JavaScript version of the smart contract
      const admission = await $.getJSON('Admission.json')
      App.contracts.Admission = TruffleContract(admission)
      App.contracts.Admission.setProvider(App.web3Provider)
  
      // Hydrate the smart contract with values from the blockchain
      App.admission = await App.contracts.Admission.deployed()
      console.log(App.admission)
    },

    createDocument: async (studentUid,docHash,docType) => {
      const status =$('#'+docType).val()
      console.log('createDocument() called!',status)
      console.log('Doc type :', docType)
      App.setLoading(true)
      console.log("Student UID from Browser",studentUid)
      await App.admission.createDocument(studentUid, docHash, docType, { from: App.account})
      window.location.reload()
    },



    viewDocument: async (docType) => {
      const studentUID=localStorage.getItem("studentUID")
      console.log("Displaying "+docType+" of "+studentUID)
      const docHash =App.docHashMap[docType]
      console.log(docHash)
      let url = `https://ipfs.infura.io/ipfs/${docHash}`;
      window.location.href=url

    },
    shareDocument: async (event,docType) => {
      event.preventDefault();
      const {third_party_name} = event.target.elements
      const studentUID=localStorage.getItem("studentUID")
      // const third_party_name =$('#'+third_party_name).val()
      console.log("Sharing "+docType+" of "+studentUID+" with "+third_party_name.value)
      const res= await axios.get("http://127.0.0.1:8000/share/",{
        params:{
          studentUID:studentUID,
          third_party_name:third_party_name.value,
          docType:docType
        }
      })
      console.log(res.data.atp)
      alert("ATP :"+res.data.atp);
    },
    
    captureFile :async (event,docType) => {
      event.preventDefault()
      
      // process file for IPFS
      const file = event.target.files[0]
      console.log('File Captured...',file)
      const reader = new FileReader()
      await reader.readAsArrayBuffer(file)
      reader.onloadend = async () => {
          console.log("Window Buffer",reader.result)
          App.buffer=new window.Buffer(reader.result);
          console.log(App.buffer)
          console.log("IPFS code")
          const output = await App.ipfs.add(App.buffer, (error, result) => {
            if(error){
              console.error(error)
              return
            }
          })
          console.log("Output",output.path)
          const docHash=output.path
          const studentUID=localStorage.getItem("studentUID")
          // let url = `https://ipfs.infura.io/ipfs/${output.path}`;

          await App.admission.createDocument(studentUID, docHash, docType, { from: App.account})
          //https://ipfs.infura.io/ipfs/QmPZRNTxTWorK3RjYy2Fj1y3bmbkTGu4FTcU6V3Yx6A9ba
          window.location.reload()

      }

    },

    render: async () => {
      // Prevent double render
      if (App.loading) {
        return
      }
  
      // Update app loading state
      App.setLoading(true)
  
      // Render Account
      $('#account').html(App.account)
  
      // Render Document for given UID
      await App.renderDocuments(localStorage.getItem("studentUID"))

      // Update loading state
      App.setLoading(false)
    },

    renderDocuments: async (uid) => {
      // Load the total task count from the blockchain
      const documentCount = await App.admission.documentCount()
      const $taskTemplate = $('.taskTemplate')
      // const StudentDocJson=[]
  
      // Render out each task with a new task template
      for (var i = 1; i <= documentCount; i++) {
        // Fetch the task data from the blockchain
        const document = await App.admission.documents(i)
        const docId = document[0].toNumber()
        const studentUid = document[1]
        const docHash = document[2]
        const docType = document[3]
        if(studentUid===uid){
          App.StudentDocJson.push({"docId":docId,"studentUid":studentUid,"docHash":docHash,"docType":docType})
          // $('#'+docType).val('View');
          App.docHashMap[docType]=docHash
          $('#'+docType+'_upload').hide();
          $('#'+docType).show();

        }
      }
    },

    setLoading: (boolean) => {
      App.loading = boolean
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
      App.load()
      $('#tenth_marksheet').hide();
      $('#twelfth_marksheet').hide();
      $('#leaving_certificate').hide();
      $('#cet_scorecard').hide();
      $('#aadhar_card').hide();

    })
  })