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
             console.log("Validated")
             window.location.href = 'http://localhost:3000/facultydashboard.html'        
         }
    },

    
  }