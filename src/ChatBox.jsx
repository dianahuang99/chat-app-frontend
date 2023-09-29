import {
  useContext,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import Logo from "./Logo";
import { UserContext } from "./UserContext.jsx";
import { uniqBy } from "lodash";
import axios from "axios";
import UserContact from "./UserContact";

import React from "react";

function ChatBox() {
  const [webSocket, setWebSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [offlineUsers, setOfflineUsers] = useState({});
  const [targetUserId, setTargetUserId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [messageHistory, setMessageHistory] = useState([]);
  const { username, id, setId, setUsername } = useContext(UserContext);
  const bottomOfChatBoxSpace = useRef();
  const imageUrlRegex = /\.(jpeg|jpg|gif|png)$/;

  useEffect(() => {
    connectToWebSocket();
  }, [targetUserId]);

  function connectToWebSocket() {
    let webSocketURL = "";
    if (import.meta.env.VITE_REACT_APP_BASE_URL) {
      const backendURL = import.meta.env.VITE_REACT_APP_BASE_URL;
      webSocketURL += "wss://" + backendURL.slice(8);
    } else {
      webSocketURL += "ws://localhost:4040";
    }
    const webSocket = new WebSocket(webSocketURL);
    setWebSocket(webSocket);
    webSocket.addEventListener("message", handleMessage);
    webSocket.addEventListener("close", () => {
      setTimeout(() => {
        console.log("Disconnected. Reconnecting");
        connectToWebSocket();
      }, 1000);
    });
  }

  function showOnlineUsers(users) {
    const onlineUsers = {};
    for (let i = 0; i < users.length; i++) {
      const { userId, username } = users[i];
      onlineUsers[userId] = username;
    }
    setOnlineUsers(onlineUsers);
  }

  function handleMessage(ev) {
    const messageData = JSON.parse(ev.data);
    console.log({ ev, messageData });
    if ("online" in messageData) {
      showOnlineUsers(messageData.online);
    } else if ("text" in messageData) {
      if (messageData.sender === targetUserId) {
        setMessageHistory((prev) => [...prev, { ...messageData }]);
      }
    }
  }

  async function logout() {
    try {
      await axios.post(`${axios.defaults.baseURL}/logout`);
      setUsername(null);
      setId(null);
      setWebSocket(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  async function sendJoke(evt) {
    if (evt) evt.preventDefault();
    const res = await axios.get(`${axios.defaults.baseURL}/joke`);
    // console.log("res", res?.data || "no data");
    console.log(res ? res.data.joke : "no data");
    try {
      webSocket.send(
        JSON.stringify({
          recipient: targetUserId,
          text: res.data.joke,
        })
      );

      setNewMessage("");
      setMessageHistory((prev) => [
        ...prev,
        {
          text: res.data.joke,
          sender: id,
          recipient: targetUserId,
          _id: Date.now(),
        },
      ]);
    } catch (error) {
      console.log("Error occurred while sending message:", error);
    }

    console.log("sent joke");
  }

  async function sendTarot(evt) {
    if (evt) evt.preventDefault();
    const res = await axios.get(`${axios.defaults.baseURL}/tarot`);
    console.log(res.data || "no data");
    const tarotCard = `${res.data.name} - ${res.data.meaning_up}`;
    try {
      webSocket.send(
        JSON.stringify({
          recipient: targetUserId,
          text: tarotCard,
        })
      );

      setNewMessage("");
      setMessageHistory((prev) => [
        ...prev,
        {
          text: tarotCard,
          sender: id,
          recipient: targetUserId,
          _id: Date.now(),
        },
      ]);
    } catch (error) {
      console.log("Error occurred while sending message:", error);
    }
    console.log("sent Tarot");
  }

  async function sendQuote(evt) {
    if (evt) evt.preventDefault();
    const res = await axios.get(`${axios.defaults.baseURL}/quote`);
    // console.log("res", res?.data || "no data");
    console.log(res ? res.data.h : "no data");
    const quote = `${res.data.q} -${res.data.a}`;
    try {
      webSocket.send(
        JSON.stringify({
          recipient: targetUserId,
          text: quote,
        })
      );

      setNewMessage("");
      setMessageHistory((prev) => [
        ...prev,
        {
          text: quote,
          sender: id,
          recipient: targetUserId,
          _id: Date.now(),
        },
      ]);
    } catch (error) {
      console.log("Error occurred while sending message:", error);
    }
    console.log("sent Quote");
  }

  async function sendMessage(evt, file = null) {
    if (evt) evt.preventDefault();
    if (newMessage !== "") {
      try {
        webSocket.send(
          JSON.stringify({
            recipient: targetUserId,
            text: newMessage,
            file,
          })
        );
        if (file) {
          const res = await axios.get(
            `${axios.defaults.baseURL}/messages/` + targetUserId
          );
          setMessageHistory(res.data);
        } else {
          setNewMessage("");
          setMessageHistory((prev) => [
            ...prev,
            {
              text: newMessage,
              sender: id,
              recipient: targetUserId,
              _id: Date.now(),
            },
          ]);
        }
      } catch (error) {
        console.log("Error occurred while sending message:", error);
      }
    }
  }

  function sendFile(evt) {
    const file = evt.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const fileData = reader.result;

      sendMessage(null, {
        name: file.name,
        data: fileData,
      });
    };

    reader.readAsDataURL(file);
  }

  useLayoutEffect(() => {
    const space = bottomOfChatBoxSpace.current;

    const scrollToBottom = () => {
      if (space) {
        space.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    };
    scrollToBottom();
    const handleUpdate = () => {
      scrollToBottom();
    };
    window.addEventListener("resize", handleUpdate);

    return () => {
      window.removeEventListener("resize", handleUpdate);
    };
  }, [messageHistory]);

  useEffect(() => {
    const fetchOfflineUsers = async () => {
      try {
        const res = await axios.get(`${axios.defaults.baseURL}/people`);
        const offlineUsersArr = [];
        res.data.forEach((user) => {
          if (user._id !== id && !onlineUsers.hasOwnProperty(user._id)) {
            offlineUsersArr.push(user);
          }
        });
        const offlineUsers = {};
        for (const user of offlineUsersArr) {
          offlineUsers[user._id] = user;
        }
        setOfflineUsers(offlineUsers);
      } catch (error) {
        console.error("Error fetching offline users:", error);
      }
    };
    fetchOfflineUsers();
  }, [onlineUsers]);

  useEffect(() => {
    if (targetUserId) {
      axios
        .get(`${axios.defaults.baseURL}/messages/` + targetUserId)
        .then((res) => {
          setMessageHistory(res.data);
        });
    }
  }, [targetUserId]);

  const onlineUsersWithoutCurrUser = { ...onlineUsers };
  delete onlineUsersWithoutCurrUser[id];

  const uniqueMessages = uniqBy(messageHistory, "_id");

  return (
    <div className="flex h-screen">
      <div className="bg-gray-400 w-1/4 flex flex-col">
        <Logo />
        <div className="flex-grow overflow-y-scroll">
          {Object.keys(onlineUsersWithoutCurrUser).map((userId) => (
            <UserContact
              key={userId}
              id={userId}
              online={true}
              username={onlineUsersWithoutCurrUser[userId]}
              onClick={() => {
                setTargetUserId(userId);
                console.log({ userId });
              }}
              selected={userId === targetUserId}
            />
          ))}

          {Object.keys(offlineUsers).map((userId) => (
            <UserContact
              key={userId}
              id={userId}
              online={false}
              username={offlineUsers[userId].username}
              onClick={() => setTargetUserId(userId)}
              selected={userId === targetUserId}
            />
          ))}
        </div>
        <div className="p-2 text-center flex items-center justify-center">
          <span className="mr-2 text-base text-white flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                clipRule="evenodd"
              />
            </svg>
            {username}
          </span>
          <button
            onClick={logout}
            className="text-sm bg-green-100 py-1 px-2 text-gray-500 border rounded-sm"
          >
            logout
          </button>
        </div>
      </div>
      <div className="flex flex-col bg-gray-700 w-3/4 p-2 ">
        <div className="flex-grow">
          {!targetUserId && (
            <div className="flex h-full flex-grow items-center justify-center">
              <div className="text-gray-300">
                &larr; Select a person to chat with from the sidebar
              </div>
            </div>
          )}
          {!!targetUserId && (
            <div className="relative h-full">
              <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                {uniqueMessages.map((message) => (
                  <div
                    key={message._id}
                    className={
                      " " + (message.sender === id ? "text-right" : "text-left")
                    }
                  >
                    <div
                      className={
                        "text-left inline-block max-w-md my-2 rounded-md text-base " +
                        (message.sender === id
                          ? "bg-green-600 text-white mr-3"
                          : "bg-white text-gray-500 ml-2")
                      }
                    >
                      {imageUrlRegex.test(message.text) ? (
                        <img
                          src={message.text}
                          alt="Image"
                          style={{ maxWidth: "100%", maxHeight: "250px" }}
                          className="p-2"
                        />
                      ) : (
                        <div className="break-words text-lg px-4 py-2">
                          {message.text.replace(/\\n/g, "\n")}
                        </div>
                      )}
                      {message.file && (
                        <div className="">
                          <a
                            target="_blank"
                            className="flex items-center gap-1 border-b"
                            href={
                              axios.defaults.baseURL +
                              "/uploads/" +
                              message.file
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {message.file}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={bottomOfChatBoxSpace}></div>
              </div>
            </div>
          )}
        </div>
        {!!targetUserId && (
          <>
            <div className="flex mb-2 gap-2">
              <form onSubmit={sendJoke} className="flex-1">
                {" "}
                <button className="text-white font-bold py-2 px-4 rounded-full border w-full h-full">
                  Send a joke!
                </button>
              </form>
              <form onSubmit={sendTarot} className="flex-1">
                {" "}
                <button className="text-white font-bold py-2 px-4 rounded-full border w-full h-full">
                  Send a random tarot card!
                </button>
              </form>
              <form onSubmit={sendQuote} className="flex-1">
                {" "}
                <button className="text-white font-bold py-2 px-4 rounded-full border w-full h-full">
                  Send a quote!
                </button>
              </form>
            </div>
            <form className="flex gap-2" onSubmit={sendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(evt) => setNewMessage(evt.target.value)}
                placeholder="New Message"
                className="bg-white flex-grow border rounded-sm p-2"
              />
              <label className="bg-green-200 p-2 text-gray-600 cursor-pointer rounded-sm border border-green-200">
                <input type="file" className="hidden" onChange={sendFile} />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z"
                    clipRule="evenodd"
                  />
                </svg>
              </label>
              <button
                type="submit"
                className="bg-green-600 p-2 text-white rounded-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ChatBox;
