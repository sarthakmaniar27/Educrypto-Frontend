App = {
    loading: false,
    contracts: {},
  
    load: async () => {
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

    createDocument: async (docType) => {
      console.log('createDocument() called!')
      console.log('Doc type :', docType)
      App.setLoading(true)
      // const content = $('#newTask').val()
      const studentUid = '2018140036'
      const docHash = 'sarthakhash'
      // const docType = 'aadhar'
      await App.admission.createDocument(studentUid, docHash, docType, { from: App.account})
      window.location.reload()
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
  
      // Render Tasks
      await App.renderDocuments()
  
      // Update loading state
      App.setLoading(false)
    },

    renderDocuments: async () => {
      // Load the total task count from the blockchain
      const documentCount = await App.admission.documentCount()
      const $taskTemplate = $('.taskTemplate')
  
      // Render out each task with a new task template
      for (var i = 1; i <= documentCount; i++) {
        // Fetch the task data from the blockchain
        const document = await App.admission.documents(i)
        const docId = document[0].toNumber()
        const studentUid = document[1]
        const docHash = document[2]
        const docType = document[3]
  
        // Create the html for the task
        // const $newTaskTemplate = $taskTemplate.clone()
        // // $newTaskTemplate.find('.content').html(docId + ' ' + studentUid + ' '+ docHash + ' ' + docType)
        // $newTaskTemplate.find('.content').html(docHash)
        // console.log(docHash)
  
        // Show the task
        // $newTaskTemplate.show()

        $('#content').html(docHash)
  
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
    }
  
  }
  
  $(() => {
    $(window).load(() => {
      App.load()
    })
  })