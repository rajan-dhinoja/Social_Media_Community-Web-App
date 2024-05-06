import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CustomButton } from ".";
import { Link } from "react-router-dom";
import { NoProfile } from "../../assets";
import axios from "axios";

const FriendRequestCard = () => {
  const { user, edit } = useSelector((state) => state.user);
  const [friendRequest, setFriendRequest] = useState([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const fetchFriendRequests = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8800/users/get-friend-requests/${user._id}`
      );
      if (response.data.success && Array.isArray(response.data.requests)) {
        setFriendRequest(response.data.requests);
      } else {
        console.error("Invalid data format received:", response.data.requests);
      }
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  };

  const acceptFriendRequest = async (id, status) => {
    try {
      const response = await axios.post(
        `http://localhost:8800/users/accept-request`,
        { rid: id, status },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      if (response.data.success) {
        // Update the friend request list after accepting/denying
        setFriendRequest((prevRequests) =>
          prevRequests.filter((request) => request._id !== id)
        );
      } else {
        console.error(
          "Failed to accept/deny friend request:",
          response.data.error
        );
      }
      window.location.reload();
    } catch (error) {
      console.error("Error accepting/denying friend request:", error);
    }
  };

  useEffect(() => {
    setLoading(false);
    fetchFriendRequests();
  }, []);

  return (
    <div className="w-full bg-primary shadow-sm rounded-lg px-10 py-6">
      <div className="flex items-center justify-between text-xl text-ascent-1 pb-2 border-b border-[#66666645]">
        <span> Friend Request</span>
        <span>{friendRequest?.length}</span>
      </div>

      {friendRequest == 0 ? (
        <div className="w-full pt-6 items-center text-lg text-ascent-2 flex flex-col">
          No Friend Requests
        </div>
      ) : (
        <div className="w-full flex flex-col gap-4 pt-4">
          {friendRequest?.map(({ _id, requestFrom: from }) => (
            <div key={_id} className="flex items-center justify-between">
              <Link
                to={"/profile/" + from._id}
                className="w-full flex gap-4 items-center cursor-pointer"
              >
                <img
                  src={from?.profileImg ?? NoProfile}
                  alt={from?.firstName}
                  className="w-10 h-10 object-cover rounded-full"
                />
                <div className="flex-1">
                  <p className="text-base font-medium text-ascent-1">
                    {from?.firstName} {from?.lastName}
                  </p>
                  <span className="text-sm text-ascent-2">
                    {from?.profession ?? "No Profession"}
                  </span>
                </div>
              </Link>

              <div className="flex gap-1">
                <CustomButton
                  title="Accept"
                  onClick={() => acceptFriendRequest(_id, "Accepted")}
                  containerStyles="bg-blueSecondary  text-xs text-white px-1.5 py-1 rounded-full"
                />
                <CustomButton
                  title="Reject"
                  onClick={() => acceptFriendRequest(_id, "Rejected")}
                  containerStyles="border border-[#666] text-xs text-ascent-1 px-1.5 py-1 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendRequestCard;
