import React, { useEffect, useState } from "react";
import Loading from "../../../user_panel/components/Loading";
import { Link } from "react-router-dom";
import moment from "moment";
import { NoProfile } from "assets";
import Slider from "react-slick";
import { MdOutlineDeleteOutline } from "react-icons/md";

const Posts = () => {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [showAll, setShowAll] = useState(0);
  const [showComments, setShowComments] = useState(0);

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const handleDelete = async (postId) => {
    try {
      // Send a request to delete the post
      const response = await fetch(
        `http://localhost:8800/posts/delete-post/${postId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // Remove the deleted post from the local state
      setPosts(posts.filter((post) => post._id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  useEffect(() => {
    // Fetch users from backend API when component mounts
    fetch("http://localhost:8800/posts/get-all-posts") // Update the endpoint according to your backend route
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
        console.error("Error fetching users:", error);
      });
  }, []); // Empty dependency array to fetch users only once when component mounts

  return (
    <>
      <div className="flex-1 px-[100px] h-full pt-5 flex flex-col gap-6 overflow-y-auto rounded-lg">
        {loading ? (
          <Loading />
        ) : posts?.length > 0 ? (
          posts.map((post) => (
            <div key={post._id} className="relative">
              <div className="mb-2 bg-primary p-4 px-5 rounded-xl ">
                <div className="flex gap-3 items-center mb-2">
                  <Link to={"/profile/" + post?.userId?._id}>
                    <img
                      src={post?.userId?.profileImg || NoProfile}
                      alt={post?.userId?.firstName}
                      className="w-12 h-12 md:w-14 md:h-14 object-cover rounded-full"
                    />
                  </Link>

                  <div className="w-full flex justify-between">
                    <div className="">
                      <Link to={"/profile/" + post?.userId?._id}>
                        <p className="font-medium text-lg">
                          {post?.userId?.firstName} {post?.userId?.lastName}
                        </p>
                      </Link>
                      <span className="text-gray-800">
                        {post?.userId?.location}
                      </span>
                    </div>

                    <span className="hidden md:flex text-gray-700">
                      {moment(post?.createdAt ?? "2023-05-25").fromNow()}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-gray-800">
                    {showAll === post?._id
                      ? post?.description
                      : post?.description.slice(0, 300)}

                    {post?.description?.length > 301 &&
                      (showAll === post?._id ? (
                        <span
                          className="text-blue ml-2 font-medium cursor-pointer"
                          onClick={() => setShowAll(0)}
                        >
                          Show Less
                        </span>
                      ) : (
                        <span
                          className="text-blue ml-2 font-medium cursor-pointer"
                          onClick={() => setShowAll(post?._id)}
                        >
                          Show More
                        </span>
                      ))}
                  </p>

                  {Array.isArray(post.files) && post.files.length > 0 ? (
                    <div className="p-3">
                      <Slider {...sliderSettings}>
                        {post.files.map((image, index) => (
                          <div
                            key={index}
                            className="w-full  h-[250px] outline-none "
                          >
                            <img
                              src={image}
                              alt={`post image ${index + 1}`}
                              className="w-full h-full mt-2 rounded-lg object-cover"
                            />
                          </div>
                        ))}
                      </Slider>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>

                <div className="mt-4 flex justify-between items-center px-3 py-2 border-t border-[#66666645]">
                  <p className="flex gap-2 items-center border-b-2 cursor-pointer">
                    {post?.likes?.length} Likes
                  </p>

                  <p
                    className="flex gap-2 items-center border-b-2 cursor-pointer"
                    onClick={() => {
                      setShowComments(
                        showComments === post._id ? null : post._id
                      );
                    }}
                  >
                    {post?.comments?.length} Comments
                  </p>

                  <div
                    className="flex gap-1 items-center text-base text-ascent-1 cursor-pointer"
                    onClick={() => handleDelete(post?._id)}
                  >
                    <MdOutlineDeleteOutline size={20} />
                    <span>Delete</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="flex pt-10 font-bold justify-center text-2xl text-ascent-2">
            No Post Available
          </p>
        )}
      </div>
    </>
  );
};

export default Posts;
