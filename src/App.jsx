
import axios from "axios"
import { UserContextProvider } from "./UserContext";
import Routes from "./Routes"

function App() {

  axios.defaults.baseURL = process.env.SERVER_BASE_URL || 'http://localhost:4040';
  axios.defaults.withCredentials = true;


  return (
    
      <UserContextProvider>
        <Routes/>
      </UserContextProvider>
    
  )
}

export default App