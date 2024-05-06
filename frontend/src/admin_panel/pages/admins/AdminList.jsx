import Card from "./../../components/card/index";
import React, { useEffect, useState } from "react";
import { AiOutlineUser } from "react-icons/ai";
import { formatDistanceToNow } from "date-fns";
import { MdOutlineDeleteOutline, MdOutlineEditNote } from "react-icons/md";
import { NoProfile } from "assets";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";

const AdminList = () => {
  const [users, setUsers] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch users from backend API when component mounts
    fetch("http://localhost:8800/users/get-all-admins") // Update the endpoint according to your backend route
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setUsers(data.users); // Set the fetched users to the state
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, []); // Empty dependency array to fetch users only once when component mounts

  return (
    <Card extra={"w-full h-full p-4"}>
      <div className="relative flex items-center justify-between pt-2">
        <div className="text-xl font-bold text-navy-700 dark:text-white">
          Admins Table
        </div>
        <Link to="/register">
          <button className="bg-blueSecondary text-white font-semibold px-5 py-2 rounded-lg">
            Add Admin
          </button>
        </Link>
      </div>

      <div className="h-full overflow-x-scroll xl:overflow-x-hidden">
        <table
          className="mt-6 h-max w-full"
          variant="simple"
          color="gray-500"
          mb="24px"
        >
          <thead className="">
            <tr>
              <th className="flex justify-center">
                <AiOutlineUser />
              </th>
              <th className="text-left text-lg">Admins</th>
              <th className="text-left-center text-lg">Roles</th>
              <th className="text-left-center text-lg">Location</th>
              <th className="text-left-center text-lg">Activity</th>
              <th className="text-left-center text-lg">Actions</th>
            </tr>
          </thead>
          <tbody className="">
            {users
              .sort((a, b) => {
                // Sort alphabetically based on firstName
                return b.createdAt.localeCompare(a.createdAt);
              })
              .map((user, index) => (
                <tr className="border-b-2" key={index}>
                  <td className="py-3">
                    <div className="flex justify-center">
                      <img
                        className="h-10 w-10 object-cover rounded-full"
                        src={user.profileImg || NoProfile}
                        alt={user.firstName}
                      />
                    </div>
                  </td>
                  <td>
                    <div className="text-semibold font-black">
                      {`${user.firstName} ${user.lastName}`}
                    </div>
                    <span className=" text-gray-600">{user.email}</span>
                  </td>
                  <td className="text-center">{user.role || " - "}</td>
                  <td className="text-center">{user.location || "-"}</td>
                  <td>
                    <div className="text-center">Account Created</div>
                    <strong className="flex justify-center">
                      {formatDistanceToNow(new Date(user.createdAt), {
                        addSuffix: true,
                      })}
                    </strong>
                  </td>
                  <td>
                    <div className="flex justify-center align-middle">
                      <MdOutlineEditNote
                        className="cursor-pointer"
                        size={30}
                        color="green"
                        onClick={handleEditProfile}
                      />
                      <MdOutlineDeleteOutline
                        className="pt-[2px] cursor-pointer"
                        size={26}
                        color="red"
                      />
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default AdminList;
