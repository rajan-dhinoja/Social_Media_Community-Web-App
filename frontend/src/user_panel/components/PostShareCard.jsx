import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CustomButton, Loading, TextInput } from "./index";
import { NoProfile } from "../../assets";
import { BsFiletypeGif } from "react-icons/bs";
import { BiImages, BiSolidVideo } from "react-icons/bi";
import { useForm } from "react-hook-form";

const PostShareCard = () => {
  const { user } = useSelector((state) => state.user); // Using useSelector to get user from state
  const [errMsg, setErrMsg] = useState(""); // Initial error message state
  const [posting, setPosting] = useState(false); // State for indicating posting status
  const [postFile, setPostFile] = useState(null); // State for holding files

  const dispatch = useDispatch(); // Using useDispatch to dispatch actions
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const fetchPost = async () => {
    setLoading(false);
  };

  const handleFilesChange = (event) => {
    const postFile = event.target.files[0];
    setPostFile(postFile);
  };

  const handlePostSubmit = async (data) => {
    setPosting(true);
    setErrMsg("");
    try {
      const postData = {
        userId: user._id,
        description: data.description,
      };
      const formData = new FormData();
      const fileName = Date.now() + "-" + postFile.name;
      formData.append("name", fileName);
      formData.append("postFile", postFile);
      postData.postFile = fileName;
      console.log(postData);
      console.log(formData);
      // Upload files
      const uploadResponse = await axios.post(
        "http://localhost:8800/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(uploadResponse.data);
      // Create post with postData
      const createPostResponse = await axios.post(
        "http://localhost:8800/posts/create-post",
        postData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // Handle successful post creation
      console.log("Post created successfully:", createPostResponse.data);
      // Reset form and state
      reset({ description: "" });
      setFiles([]); // Clear files array
      setErrMsg("");
    } catch (error) {
      console.error("Error Creating Post: ", error);
      setErrMsg("Error creating post. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <form
      method="POST"
      onSubmit={handleSubmit(handlePostSubmit)}
      className="bg-primary px-4 rounded-lg"
    >
      <div className="w-full flex items-center gap-2 py-4 border-b border-[#66666645]">
        <img
          src={user?.profileImg ?? NoProfile}
          alt="User Image"
          className=" h-16 rounded-full object-cover"
        />
        <TextInput
          styles="w-full rounded-full py-5"
          placeholder="What's on your mind...."
          name="description"
          register={register("description", {
            required: "Write something about post",
          })}
          error={errors.description ? errors.description.message : ""}
        />
      </div>

      {errMsg?.message && (
        <span
          role="alert"
          className={`text-sm ${
            errMsg?.status === "failed"
              ? "text-[#f64949fe]"
              : "text-[#2ba150fe]"
          } mt-0.5`}
        >
          {errMsg?.message}
        </span>
      )}

      <div className="flex items-center justify-between py-3 px-4">
        <label
          htmlFor="imgUpload"
          className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer"
        >
          <input
            type="file"
            multiple
            onChange={handleFilesChange}
            className="hidden"
            id="imgUpload"
            data-max-size="5120"
            accept=".jpg, .png, .jpeg"
          />
          <BiImages size={25} />
          <span className="text-lg">Image</span>
        </label>

        <label
          className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer"
          htmlFor="videoUpload"
        >
          <input
            type="file"
            data-max-size="5120"
            multiple
            onChange={handleFilesChange}
            className="hidden"
            id="videoUpload"
            accept=".mp4, .wav"
          />
          <BiSolidVideo size={26} />
          <span className="text-lg">Video</span>
        </label>

        <label
          className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer"
          htmlFor="vgifUpload"
        >
          <input
            type="file"
            data-max-size="5120"
            multiple
            onChange={handleFilesChange}
            className="hidden"
            id="vgifUpload"
            accept=".gif"
          />
          <BsFiletypeGif size={24} />
          <span className="text-lg">Gif</span>
        </label>

        <div>
          {posting ? (
            <Loading />
          ) : (
            <CustomButton
              type="submit"
              title="Post"
              containerStyles="bg-blueSecondary text-white py-2 px-6 rounded-full font-semibold text-md"
            />
          )}
        </div>
      </div>
    </form>
  );
};

export default PostShareCard;
