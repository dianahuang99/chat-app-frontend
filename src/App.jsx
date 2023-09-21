
import axios from "axios"
import { UserContextProvider } from "./UserContext";
import Routes from "./Routes"

function App() {
  if(process.env.SERVER_BASE_URL){
    axios.defaults.baseURL = SERVER_BASE_URL
  } else{
    axios.defaults.baseURL = 'http://localhost:4040';
  }
  
  axios.defaults.withCredentials = true;


  return (
    
      <UserContextProvider>
        <Routes/>
      </UserContextProvider>
    
  )
}

export default App