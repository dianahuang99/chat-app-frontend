import React, { useContext } from "react";
import { UserContext } from "./UserContext";
import HomepageForm from "./HomepageForm";
import ChatBox from "./ChatBox.jsx";

function Routes() {
  const { username, id } = useContext(UserContext);

  if (username) {
    return <ChatBox />;
  }

  return <HomepageForm />;
}

export default Routes