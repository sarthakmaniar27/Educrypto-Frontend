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
      if (typeof web3 !== 'undefined') {
        App.web3Provider = web3.currentProvider
        web3 = new Web3(web3.currentProvider)
        console.log('web3 is loaded...',web3)
      } else {
        window.alert("Please connect to Metamask.")
      }
      if (window.ethereum) {
        window.web3 = new Web3(ethereum)
        try {
          await ethereum.enable()
          web3.eth.sendTransaction({/* ... */})
        } catch (error) {
        }
      }
      else if (window.web3) {
        App.web3Provider = web3.currentProvider
        window.web3 = new Web3(web3.currentProvider)
        web3.eth.sendTransaction({/* ... */})
      }
      else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }
    },
  
    loadAccount: async () => {
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
      var startTime = performance.now()
      event.preventDefault()
      
      // process file for IPFS
      const file = event.target.files[0]
      console.log('File Captured...',file)
      const reader = new FileReader()
      await reader.readAsArrayBuffer(file)
      reader.onloadend = async () => {
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
          var endTime = performance.now()
          console.log(`Call to upload on IPFS and blockchain took ${endTime - startTime} milliseconds`)
          window.location.reload()
      }
    },

    render: async () => {
      if (App.loading) {
        return
      }
      App.setLoading(true)
      $('#account').html(App.account)
      await App.renderDocuments(localStorage.getItem("studentUID"))
      App.setLoading(false)
    },

    renderDocuments: async (uid) => {
      const documentCount = await App.admission.documentCount()
      for (var i = 1; i <= documentCount; i++) {
        const document = await App.admission.documents(i)
        const docId = document[0].toNumber()
        const studentUid = document[1]
        const docHash = document[2]
        const docType = document[3]
        if(studentUid===uid){
          App.StudentDocJson.push({"docId":docId,"studentUid":studentUid,"docHash":docHash,"docType":docType})
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