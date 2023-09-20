import React from "react";
import ProfileIcon from "./ProfileIcon";

function UserContact({ id, username, onClick, selected, online }) {
  return (
    <div
      key={id}
      onClick={() => onClick(id)}
      className={
        "border-b border-gray-100 flex items-center gap-2 cursor-pointer " +
        (selected ? "bg-green-50" : "")
      }
    >
      {selected && <div className="w-1 bg-green-500 h-12 rounded-r-md"></div>}
      <div className="flex gap-2 py-2 pl-4 items-center">
        <ProfileIcon online={online} username={username} userId={id} />
        <span className={(selected ? "text-gray-600" : "text-white")}>{username}</span>
      </div>
    </div>
  );
}

export default UserContact;