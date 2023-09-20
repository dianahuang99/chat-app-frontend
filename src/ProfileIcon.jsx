import React from "react";

function ProfileIcon({ userId, username, online }) {
  const colors = [
    "bg-red-300",
    "bg-purple-300",
    "bg-green-300",
    "bg-pink-300",
    "bg-teal-300",
    "bg-yellow-300"]

  let randomNumber = 0;
  for (let i = 0; i < userId.length; i++) {
    randomNumber += userId.charCodeAt(i);
  }

  const colorIdx = randomNumber % 6;
  const color = userId === undefined ? "bg-purple-200" : colors[colorIdx];

  return (
    <div className={color + " w-8 h-8 relative rounded-full flex items-center"}>
      <div className="text-center w-full text-white">
        {username ? username[0].toUpperCase() : "a"}
      </div>
      {online && (
        <div className="absolute w-3 h-3 bg-green-400 bottom-0 right-0 rounded-full border border-white"></div>
      )}
      {!online && (
        <div className="absolute w-3 h-3 bg-gray-400 bottom-0 right-0 rounded-full border border-white"></div>
      )}
    </div>
  );
}

export default ProfileIcon;
