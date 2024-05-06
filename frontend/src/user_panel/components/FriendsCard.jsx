import React from "react";
import { Link } from "react-router-dom";
import { NoProfile } from "../../assets";
import { MdOutlineDeleteOutline } from "react-icons/md";

const FriendsCard = ({ friends }) => {
  return (
    <div>
      <div className="w-full bg-primary shadow-sm rounded-lg px-10 py-6">
        <div className="flex items-center justify-between text-2xl text-ascent-1 pb-2 border-b border-[#66666645]">
          <span> Friends</span>
          <span>{friends?.length}</span>
        </div>

        {friends.length == 0 ? (
          <div className="w-full pt-6 items-center text-xl text-ascent-2 flex flex-col">
            No Friends
          </div>
        ) : (
          <div className="w-full flex flex-col gap-4 pt-4">
            {friends?.map((friend) => (
              <Link
                to={"/profile/" + friend?._id}
                key={friend?._id}
                className="w-full flex gap-4 items-center cursor-pointer"
              >
                <img
                  src={friend?.profileImg ?? NoProfile}
                  alt={friend?.firstName}
                  className="w-[50px] h-[50px] object-cover rounded-full"
                />
                <div className="flex-1">
                  <p className="text-base font-medium text-ascent-1">
                    {friend?.firstName} {friend?.lastName}
                  </p>
                  <span className="text-sm text-ascent-2">
                    {friend?.profession ?? "No Profession"}
                  </span>
                </div>
                <MdOutlineDeleteOutline
                  className="  cursor-pointer"
                  size={26}
                  color="red"
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsCard;
