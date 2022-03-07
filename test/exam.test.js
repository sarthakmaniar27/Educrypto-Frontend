const { assert } = require('chai');

const Exam = artifacts.require("Exam");


require('chai')
    .use(require('chai-as-promised'))
    .should()


contract('Exam',(accounts)=>{

    let exam

    before(async()=>{
        exam=await Exam.deployed()
    })

    describe('Exam deployement',async()=>{
        it('deploys successfully',async()=>{
            const address=exam.address
            console.log(address)
            assert.notEqual(address,'')
            assert.notEqual(address,0x0)
            assert.notEqual(address,null)
            assert.notEqual(address,undefined)
        })
    })

    describe('Storage Question Paper',async()=>{
        it('Updates the Exam: Create Question Paper ',async()=>{
            let fid='2018140003'
            let testName='Test 1'
            let qpHash='abcdefgh'
            let branch='abcdefgh'
            let subject='subject'
            const block= await exam.createQuestionPaper(fid, testName, qpHash, branch, subject)
            assert.isNotNull(block)
        })
    })


    describe('Storage Answer Paper',async()=>{
        it('Updates the Exam: Create Answer Paper ',async()=>{
            let studentUid='2018140003'
            let testName='Test 1'
            let apHash='abcdefgh'
            let branch='abcdefgh'
            let subject='subject'

            const block= await exam.createAnswerPaper(studentUid, testName, apHash, branch, subject)
            assert.isNotNull(block)
        })
    })
    
})