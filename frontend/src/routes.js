import React from "react";

// Admin Imports
import MainDashboard from "./admin_panel/views/admin/default";

// Icon Imports
import {
  MdHome,
} from "react-icons/md";
import PostList from "./admin_panel/pages/posts/PostList";
import UserList from './admin_panel/pages/users/UserList';
import AdminList from './admin_panel/pages/admins/AdminList';

const routes = [
  {
    name: "Main Dashboard",
    layout: "/admin",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboard />,
  },
  {
    name: "List of Users",
    layout: "/admin",
    path: "list-of-users",
    component: <UserList />,
  },
  {
    name: "List of Posts",
    layout: "/admin",
    path: "list-of-posts",
    component: <PostList />,
  },
  {
    name: "List of Admins",
    layout: "/admin",
    path: "list-of-admins",
    component: <AdminList />,
  },
];
export default routes;
