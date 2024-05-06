import axios from "axios";
import { SetPosts } from "../redux/postSlice";

const API_URL = "http://localhost:8800";

export const API = axios.create({
  baseURL: API_URL,
  responseType: "json",
});

export const apiRequest = async ({ url, token, data, method }) => {
  try {
    const result = await API(url, {
      method: method || "GET",
      data: data || {},
      headers: {
        "content-type": "application/json",
        Authorization: token ? `Bearer${token}` : "",
      },
    });
    return result.data;
  } catch (error) {
    const err = error.response.data;
    console.error(err, error);

    return { status: err.success, message: err.message };
  }
};

export const handleProfileUpload = async (profileImg) => {
  try {
    const data = new FormData();
    data.append('profileImg', profileImg); // Append the file to the FormData object
    // Make POST request to upload files
    const uploadResponse = await axios.post(
      "http://localhost:8800/users/upload-profile",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    // Extract uploaded file names from the response
    const uploadedProfile = uploadResponse.data;
    console.log(uploadedProfile);
  } catch (error) {
    console.error("Error uploading files:", error);
  }
};

export const handleFilesUpload = async (files) => {
  try {
    const data = new FormData();
    for (const key of Object.keys(files)) {
      data.append("files", files[key]);
    }
    // Make POST request to upload files
    const uploadResponse = await axios.post(
      "http://localhost:8800/posts/upload-files",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    // Extract uploaded file names from the response
    const uploadedFiles = uploadResponse.data;
    console.log(uploadedFiles);
  } catch (error) {
    console.error("Error uploading files:", error);
  }
};

export const fetchPosts = async (token, dispatch, uri, data) => {
  try {
    const res = await apiRequest({
      url: uri || "posts",
      token: token,
      method: "POST",
      data: data || {},
    });

    dispatch(SetPosts(res?.data));
    return;
  } catch (error) {
    console.error(error);
  }
};

export const likePost = async ({ uri, token }) => {
  try {
    const res = await apiRequest({
      url: uri,
      token: token,
      method: "POST",
    });

    return res;
  } catch (error) {
    console.error(error);
  }
};

export const deletePost = async (id, token) => {
  try {

  } catch (error) {
    console.error(error);
  }
};

export const getUserInfo = async (token, id) => {
  try {
    const uri = id === undefined ? "/users/get-user" : "/users/get-user" + id;
    const res = await apiRequest({
      url: uri,
      token: token,
      method: "POST",
    });

    if (res?.message === "Authentication Failed") {
      localStorage.removeItem("user");
      window.alert("User session expired. Login again.");
      window.location.replace("/login");
    }
    return res?.user;
  } catch (error) {
    console.error(error);
  }
};

export const sendFriendsRequest = async (token, id) => {
  try {
    const res = await apiRequest({
      url: "/users/friend-request",
      token: token,
      method: "POST",
      data: { requestTo: id },
    });
    return;
  } catch (error) {
    console.error(error);
  }
};

export const viewUserProfile = async (token, id) => {
  try {
    const res = await apiRequest({
      url: "/users/profile-view",
      token: token,
      method: "POST",
      data: { id },
    });
    return;
  } catch (error) {
    console.error(error);
  }
};
