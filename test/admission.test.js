const { assert } = require('chai');

const Admission = artifacts.require("Admission");


require('chai')
    .use(require('chai-as-promised'))
    .should()


contract('Addmission',(accounts)=>{

    let admission

    before(async()=>{
        admission=await Admission.deployed()
    })

    describe('Admission deployement',async()=>{
        it('deploys successfully',async()=>{
            const address=admission.address
            console.log(address)
            assert.notEqual(address,'')
            assert.notEqual(address,0x0)
            assert.notEqual(address,null)
            assert.notEqual(address,undefined)
        })
    })

    describe('Storage',async()=>{
        it('Updates the Admission ',async()=>{
            let studentUID='2018140003'
            let docHash='abcdefgh'
            let docType='abcdefgh'
            const block= await admission.createDocument(studentUID,docHash,docType)
            assert.isNotNull(block)
        })
    })
    
})