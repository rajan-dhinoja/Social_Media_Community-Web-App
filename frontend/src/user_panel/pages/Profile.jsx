import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FriendsCard,
  Loading,
  PostCard,
  ProfileCard,
  TopBar,
} from "../components";
import { useParams } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [userInfo, setUserInfo] = useState(user);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8800/posts/get-user-posts/${id}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`, // Pass user token for authentication
          },
        }
      );
      setPosts(response.data.data); // Assuming the posts are returned in response.data.data
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPosts();
  }, [user, id]);

  return (
    <>
      <div className="home w-full px-0 pb-20 bg-bgColor lg:rounded-lg h-screen overflow-hidden">
        <TopBar />
        <div className="w-full flex gap-2 lg:gap-2 md:pl-4 pt-5 pb-10 h-full">
          {/* LEFT */}
          <div className="hidden w-1/3 lg:w-[350px] h-full md:flex flex-col gap-5 overflow-y-auto">
            <ProfileCard user={userInfo} />

            <div className="block lg:hidden">
              <FriendsCard friends={userInfo?.friends} />
            </div>
          </div>

          {/* CENTER */}
          <div className=" flex-1 h-full px-4 flex flex-col gap-6 overflow-y-auto">
            {loading ? (
              <Loading />
            ) : posts?.length > 0 ? (
              posts?.map((post) => (
                <PostCard
                  post={post}
                  key={post?._id}
                  user={user}
                  deletePost={handleDelete}
                  likePost={handleLikePost}
                />
              ))
            ) : (
              <div className="flex w-full h-full items-center justify-center">
                <p className="text-2xl font-bold text-ascent-2">
                  No Post Available
                </p>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="hidden w-1/4 h-full lg:flex flex-col gap-8 overflow-y-auto">
            <FriendsCard friends={userInfo?.friends} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
