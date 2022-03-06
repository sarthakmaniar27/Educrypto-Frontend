Login = {
    loginUser:  async () => {
        const uid=$('#uid').val()
        const password=$('#password').val()
        localStorage.setItem("studentUID",uid)
        // console.log(localStorage.getItem("studentUID"))
        const res= await axios.get("http://127.0.0.1:8000/login/",{
            params:{
              uid:uid,
              password:password
            }
          })
        
        console.log(res)
        if(res.data.res=="Valid"){
            console.log("Validated")
            // return <Navigate to='/welcome'/>
            // navigate.push('/welcome')
            // this.props.history.push('/welcome')
            window.location.href = 'http://localhost:3000/studentdashboard.html'        
        }
    },
  }
  
//   $(() => {
//     $(window).load(() => {
//         Login.load()
//     })
//   })