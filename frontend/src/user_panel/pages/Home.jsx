import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  EditProfile,
  FriendRequestCard,
  FriendsCard,
  Loading,
  PostCard,
  PostShareCard,
  ProfileCard,
  SuggestedFriendsCard,
  TopBar,
} from "../components";

const Home = () => {
  const { user, edit } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);

  const dispatch = useDispatch();

  const fetchPost = async () => {
    try {
      await fetch("http://localhost:8800/posts/get-all-posts")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          setPosts(data.posts); // Set the fetched users to the state
        })
        .catch((error) => {
          console.error("Error fetching Posts:", error);
        });
    } catch (error) {
      console.error(error);
    }
  };

  const handleLikePost = async (uri) => {
    await likePost({ uri: uri, token: user?.token });
    await fetchPost();
  };

  const handleDelete = async () => {
    try {
      // Send a request to delete the post
      const response = await fetch(
        `http://localhost:8800/posts/delete-post/${user._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.token}`, // Include user token for authentication
          },
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      setPosts(posts.filter((post) => post._id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const getUser = async () => {
    const res = await getUserInfo(user?.token);
    const newData = { token: user?.token, ...res };
    dispatch(UserLogin(newData));
  };

  useEffect(() => {
    setLoading(false);
    getUser();
    fetchPost();
  }, []);

  return (
    <>
      <div className="w-full px-0 lg:px-0 pb-20 2xl:px-0 bg-bgColor lg:rounded-lg h-screen overflow-hidden">
        <TopBar />

        <div className="w-full flex gap-3 lg:gap-2 pt-5 pb-10 h-full">
          {/* LEFT */}
          <div className="hidden w-1/3 lg:w-[380px] h-full md:flex flex-col gap-5 overflow-y-auto">
            <ProfileCard user={user} />
            <FriendsCard friends={user?.friends} />
          </div>

          {/* CENTER */}
          <div className="flex-1 h-full px-6 flex flex-col gap-4 overflow-y-auto rounded-lg">
            <PostShareCard />

            {loading ? (
              <Loading />
            ) : posts?.length > 0 ? (
              posts?.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  user={user}
                  deletePost={handleDelete}
                  likePost={handleLikePost}
                />
              ))
            ) : (
              <div className="flex w-full h-full items-center justify-center">
                <p className="text-3xl text-ascent-2 font-semibold">
                  No Post Available
                </p>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className=" sm: hidden md:hidden w-[320px] h-full lg:flex flex-col gap-5 overflow-y-auto">
            {/* <FriendRequestsCard /> */}
            <FriendRequestCard />

            {/* <SuggestedFriendsCard /> */}
            <SuggestedFriendsCard />
          </div>
        </div>
      </div>

      {edit && <EditProfile />}
    </>
  );
};

export default Home;
