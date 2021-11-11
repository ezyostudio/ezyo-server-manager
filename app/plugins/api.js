export default ({ $axios, error, $swal}, inject)=>{
  const api = $axios.create({
    baseURL: 'http://localhost:3075/'
  });

  api.interceptors.response.use((response) => response, (err) => {
    if(process.server) {
      console.error(err);
      error({message: "The API server seems unavailable"});
    }else{
      $swal.fire({
        title: 'error'
      })
    }
    
    // throw error;
  });

  inject('api', api);
};
