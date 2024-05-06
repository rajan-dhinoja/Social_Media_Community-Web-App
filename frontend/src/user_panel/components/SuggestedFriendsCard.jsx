import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { NoProfile } from "../../assets";
import { BsPersonFillAdd } from "react-icons/bs";
import { BiSend } from "react-icons/bi";
import axios from "axios";

const SuggestedFriendsCard = () => {
  const { user, edit } = useSelector((state) => state.user);
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const fetchSuggestedFriends = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8800/users/${user._id}/suggested-friends`
      );
      if (response.data.success && Array.isArray(response.data.data)) {
        setSuggestedFriends(response.data.data);
      } else {
        console.error("Invalid data format received:", response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const sendFriendRequest = async (friendId) => {
    try {
      const requestData = {
        senderId: user._id, // Assuming user._id is the sender's ID
      };

      await axios.post(
        `http://localhost:8800/users/send-friend-request/${friendId}`,
        requestData
      );

      // Update the state to indicate that the request has been sent
      setSuggestedFriends();
      console.log("Friend request sent successfully");
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  useEffect(() => {
    setLoading(false);
    fetchSuggestedFriends();
  }, [user]);

  return (
    <div className="w-full bg-primary shadow-sm rounded-lg px-10 py-6">
      <div className="flex items-center justify-between text-xl text-ascent-1 border-b border-[#66666645]">
        <span>Friend Suggestion</span>
      </div>
      <div className="w-full flex flex-col gap-4 pt-4">
        {suggestedFriends.map((friend) => (
          <div className="flex items-center justify-between" key={friend._id}>
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
              <div className="flex flex-col py-1 ">
                <p className="text-lg font-medium text-ascent-1">
                  {friend?.firstName} {friend?.lastName}
                </p>
                <span className="text-sm text-ascent-2">
                  {friend?.profession ?? "No Profession"}
                </span>
              </div>
            </Link>

            <div className="flex gap-1">
              <button
                className="bg-lightPrimary text-2xl text-blueSecondary p-1 rounded"
                onClick={() => sendFriendRequest(friend._id)}
                disabled={friend.requestSent} // Disable button if request has been sent
              >
                {friend.requestSent ? (
                  <BiSend className="text-black" />
                ) : (
                  <BsPersonFillAdd />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedFriendsCard;
