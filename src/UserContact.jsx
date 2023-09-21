import React from "react";
import ProfileIcon from "./ProfileIcon";

function UserContact({ id, username, onClick, selected, online }) {
  return (
    <div
      key={id}
      onClick={() => onClick(id)}
      className={
        "flex items-center gap-2 cursor-pointer hover:bg-gray-600 " +
        (selected ? "bg-green-50 text-gray-600 hover:text-white" : "text-white hover:text-gray-300")
      }
    >
      {selected && <div className="w-1.5 bg-green-500 h-14 rounded-r-md"></div>}
      <div className="flex gap-2 py-2 pl-4 items-center">
        <ProfileIcon online={online} username={username} userId={id} />
        <span className={"text-lg"}>{username}</span>
      </div>
    </div>
  );
}

export default UserContact;