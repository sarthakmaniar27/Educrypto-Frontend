FacultyLogin = {
    facultyLogin:  async () => {
        const fid=$('#fid').val()
        const password=$('#password').val()
        console.log(fid,password)
        localStorage.setItem("fid",fid)
        const res= await axios.get("http://127.0.0.1:8000/facultylogin/",{
            params:{
            fid:fid,
            password:password
            }
        })
        
        console.log(res)
         if(res.data.res=="Valid"){
             console.log("Validated",res)
             localStorage.setItem("FacultyName",res.data.name)
             
             window.location.href = 'http://localhost:3000/facultydashboard.html'        
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
        
        console.log(res.data.res)
         if(res){             
            //  window.location.href = 'http://localhost:3000/facultydashboard.html'        
         }
         window.alert("Subject Report has been sucessfully generated")
    },

    

    
  }

  $(() => {
    $(window).load(() => {
        $('#welcometext').html("<h2> Welcome "+localStorage.getItem("FacultyName")+"</h2>")


    })
})