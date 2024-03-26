import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import firebaseConfig from "./firebaseConfig";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Registration from "./pages/registration";
import Login from "./pages/login";
import Profile from "./pages/profile";
import store from "./store";
import { Provider } from "react-redux";
import Editpro from "./pages/edit";
import Home from "./pages/home";
import CoverPhoto from "./pages/coverphoto";
import ProfileFriends from "./pages/profileFriends";
import ProjectModal from "./componant/projectmodal";

const root = ReactDOM.createRoot(document.getElementById("root"));
const router = createBrowserRouter([
  {
    path: "/registration",
    element: <Registration />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/editprofile",
    element: <Editpro/>,
  },
  {
    path: "/",
    element: <Home/>,
  },
  {
    path: "/coverphoto",
    element: <CoverPhoto/>,
  },
  {
    path: "/friends",
    element: <ProfileFriends/>,
  },
  {
    path: "/project",
    element: <ProjectModal/>,
  },
]);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
