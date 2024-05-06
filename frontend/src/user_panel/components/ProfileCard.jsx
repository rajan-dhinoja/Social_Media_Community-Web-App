import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { LiaEditSolid } from "react-icons/lia";
import { BsPersonFillAdd } from "react-icons/bs";
import moment from "moment";
import { NoProfile } from "../../assets";
import { UpdateProfile } from "../../redux/userSlice";
import { MdVerified } from "react-icons/md";
import { IoCloseCircleOutline } from "react-icons/io5";

const ProfileCard = ({ user }) => {
  const { user: data, edit } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  return (
    <div>
      <div className="w-full bg-primary flex flex-col items-center shadow-sm rounded-xl px-10 py-6">
        <div className="w-full pb-5 border-b border-[#66666645]">
          <div className="w-full h-[10px] flex justify-end">
            {user?._id === data?._id ? (
              <LiaEditSolid
                size={30}
                className="text-ascent-1 cursor-pointer"
                onClick={() => dispatch(UpdateProfile(true))}
              />
            ) : (
              <button
                className="bg-[#0444a430] text-sm text-white p-1 rounded"
                onClick={() => {}}
              >
                <BsPersonFillAdd size={20} className="text-ascent-1 " />
              </button>
            )}
          </div>

          <Link to={"/profile/" + user?._id}>
            <div className="w-full flex flex-col items-center pb-2">
              <img
                src={user?.profileImg ?? NoProfile}
                alt={user?.email}
                className="w-[140px] h-[140px] object-cover rounded-full"
              />
            </div>
            <div className="w-full flex flex-col items-center justify-center">
              <p className="text-3xl font-bold text-ascent-1">
                {user?.firstName} {user?.lastName}
              </p>
              <span className=" text-lg   text-ascent-2">
                {user?.profession ?? "No Profession"}
              </span>
            </div>
          </Link>
        </div>

        <div className="w-full bg-primary flex flex-col items-center py-1 border-b border-[#66666645] ">
          <div className="mt-4 mb-3 flex gap-4 md:!gap-14 ">
            <div className="flex items-center justify-center gap-2">
              <p className="text-4xl font-bold text-ascent-1 dark:text-white">
                {user?.friends?.length}
              </p>
              <p className="text-xl font-normal text-ascent-2">Friends</p>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col gap-2 py-2 pt-6">
          <span className="text-base text-blue">
            {user?.verified ? (
              <div className="flex items-center gap-2">
                <span className="text-ascent-1">Verified Account</span>
                <span className="">
                  <MdVerified color="green" size={20} />
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-ascent-1">Not Verified Account</span>
                <span className="">
                  <IoCloseCircleOutline color="red" size={20} />
                </span>
              </div>
            )}
          </span>

          <div className="flex items-left">
            <span className="text-ascent-2 pr-2">Joined:-</span>
            <span className="text-ascent-1 text-base">
              {moment(user?.createdAt).fromNow()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
