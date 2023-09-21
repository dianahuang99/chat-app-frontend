import axios from "axios";
import { useState, useContext, useEffect } from "react";
import { UserContext } from "./UserContext";

import React from "react";

function HomepageForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginOrRegister, setIsLoginOrRegister] = useState("register");
  const [flashLoginError, setFlashLoginError] = useState([]);
  const [flashLoginVisible, setFlashLoginVisible] = useState(true);
  const [flashRegisterError, setFlashRegisterError] = useState([]);
  const [flashRegisterVisible, setFlashRegisterVisible] = useState(true);
  const [clickedLogin, setClickedLogin] = useState(0);
  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);

  async function handleSubmit(evt) {
    evt.preventDefault();
    const url = isLoginOrRegister === "register" ? "register" : "login";
    try {
      const { data } = await axios.post(url, { username, password });
      console.log("sent over");
      setLoggedInUsername(username);
      setId(data.id);
    } catch (err) {
      console.log("wrong password/username");

      setClickedLogin((prevClicks) => prevClicks + 1);
      console.log(clickedLogin);
      console.log(err);
    }
  }

  useEffect(() => {
    const fetchFlashMessages = async () => {
      console.log("runnnn");
      if (clickedLogin > 0) {
        try {
          const response = await axios.get("/api/flash-messages");
          isLoginOrRegister === "register"
            ? setFlashRegisterError(response.data.flashMessages.error)
            : setFlashLoginError(response.data.flashMessages.error);

          console.log(flashLoginError);
        } catch (err) {
          console.log("nope didn't work");
          console.log(err);
        }
      }
    };
    fetchFlashMessages();
  }, [clickedLogin]);

  return (
    <div className="h-screen flex bg-green-50 items-center">
      <form className="w-80 mx-auto mb-12" onSubmit={handleSubmit}>
        {flashLoginVisible && flashLoginError && (
          <div className="text-center mt-2">
            {flashLoginError.map((message, index) => (
              <div key={index} className="flash-message error">
                {message}
              </div>
            ))}
          </div>
        )}

        {flashRegisterVisible && flashRegisterError && (
          <div className="text-center mt-2">
            {flashRegisterError.map((message, index) => (
              <div key={index} className="flash-message error">
                {message}
              </div>
            ))}
          </div>
        )}

        <input
          value={username}
          onChange={(evt) => setUsername(evt.target.value)}
          type="text"
          placeholder="username"
          className="block border w-full p-3 bg-green-100 mb-2 rounded-md"
        />
        <input
          value={password}
          onChange={(evt) => setPassword(evt.target.value)}
          type="password"
          placeholder="password"
          className="block border w-full p-3 bg-green-100 mb-2 rounded-md"
        />
        <button className="p-3 bg-green-600 text-white block w-full rounded-md">
          {isLoginOrRegister === "register" ? "Register" : "Login"}
        </button>
        <div className="text-center mt-2">
          {isLoginOrRegister === "login" && (
            <>
              <div>Don't have an account?</div>
              <button
                onClick={() => {
                  setIsLoginOrRegister("register");
                  setFlashRegisterError([]);
                  setFlashRegisterVisible(true);
                  setFlashLoginVisible(false);
                }}
              >
                Click here to register
              </button>
            </>
          )}
          {isLoginOrRegister === "register" && (
            <>
              <div>Have an account?</div>
              <button
                onClick={() => {
                  setIsLoginOrRegister("login");
                  setFlashLoginError([]);
                  setFlashLoginVisible(true);
                  setFlashRegisterVisible(false);
                }}
              >
                Click here to log in
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

export default HomepageForm;
