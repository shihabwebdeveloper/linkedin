import React, { useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { ColorRing } from "react-loader-spinner";
import { ToastContainer, toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { getDatabase, ref, set, push } from "firebase/database";

const Registration = () => {
  const auth = getAuth();
  const db = getDatabase();
  const navigate = useNavigate();
  let [email, setEmail] = useState("");
  let [fullname, setFullName] = useState("");
  let [password, setPassword] = useState("");
  let [emailerr, setEmailerr] = useState("");
  let [fullnameerr, setFullNameerr] = useState("");
  let [passworderr, setPassworderr] = useState("");
  let [passwordshow, setPasswordShow] = useState(false);
  let [loader, setLoader] = useState(false);

  let handleEmail = (e) => {
    setEmail(e.target.value);
    setEmailerr("");
  };

  let handleFullName = (e) => {
    setFullName(e.target.value);
    setFullNameerr("");
  };

  let handlePassword = (e) => {
    setPassword(e.target.value);
    setPassworderr("");
  };

  let handleSubmit = () => {
    if (!email) {
      setEmailerr("Email is requird");
    } else {
      if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        setEmailerr("Invalid Email");
      }
    }
    if (!fullname) {
      setFullNameerr("Full name is requird");
    }
    if (!password) {
      setPassworderr("Password is requird");
    } else {
      if (!/^(?=.{6,})/.test(password)) {
        setPassworderr("Password must be 6 character or longer");
      }
    }
    if (
      email &&
      fullname &&
      password &&
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) &&
      /^(?=.{6,})/.test(password)
    ) {
      setLoader(true);
      createUserWithEmailAndPassword(auth, email, password)
        .then((user) => {
          updateProfile(auth.currentUser, {
            displayName: fullname,
            photoURL: "images/avatar.png",
            coverPhoto: "images/coverphoto.png"
          });
          sendEmailVerification(auth.currentUser)
            .then(() => {
              toast.success("Registration succces. Please verify your email");
              setEmail("");
              setFullName("");
              setPassword("");
              setTimeout(() => {
                navigate("/login");
              }, 1500);
              setLoader(false);
            })
            .then(() => {
              set(ref(db, "users/" +user.user.uid), {
                username: user.user.displayName,
                email: user.user.email,
                coverPhoto: ("images/coverphoto.png"),
                profilePhoto : ("images/profile.png")
              });
            });
        })
        .catch((error) => {
          if (error.code.includes("auth/email-already-in-use")) {
            setEmailerr("Email already in use");
          }
          setLoader(false);
        });
    }
  };

  return (
    <div className="flex justify-center w-full h-screen">
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="mt-16">
        <img className="mx-auto" src="images/logo.png" />
        <div>
          <h2 className="font-nunito font-bold text-4xl text-center text-themes mt-11">
            Get started with easily register
          </h2>
          <h5 className="font-nunito font-regular text-xl text-center mt-3 mb-14">
            Free register and you can enjoy it
          </h5>
        </div>
        <div className="relative">
          <div className="bg-white absolute top-[-8px] left-[40px]">
            <h5 className="font-nunito font-semibold text-sm text-themes pl-[27px] pr-[45px]">
              Email Address
            </h5>
          </div>
          <input
            type="email"
            value={email}
            onChange={handleEmail}
            className="py-7 pl-[65px] pr-[50px] w-[497px] rounded-lg border border-solid border-[#B8BACF] outline-none"
            placeholder="Enter your email"
          />
          <h4 className="font-nunito font-semibold text-xl text-white w-[497px] rounded-lg absolute bottom-[-31px] left-0 pl-3 bg-red-600 mt-1.5">
            {emailerr}
          </h4>
        </div>
        <div className="relative mt-11">
          <div className="bg-white absolute top-[-8px] left-[40px]">
            <h5 className="font-nunito font-semibold text-sm text-themes pl-[27px] pr-[45px]">
              Full name
            </h5>
          </div>
          <input
            type="text"
            value={fullname}
            onChange={handleFullName}
            className="py-7 pl-[65px] pr-[50px] w-[497px] rounded-lg border border-solid border-[#B8BACF] outline-none"
          />
          <h4 className="font-nunito font-semibold text-xl text-white w-[497px] rounded-lg absolute bottom-[-31px] left-0 pl-3 bg-red-600 mt-1.5">
            {fullnameerr}
          </h4>
        </div>
        <div className="relative mt-11">
          <div className="bg-white absolute top-[-8px] left-[40px]">
            <h5 className="font-nunito font-semibold text-sm text-themes pl-[27px] pr-[45px]">
              Password
            </h5>
          </div>
          <input
            onChange={handlePassword}
            value={password}
            type={passwordshow ? "text" : "password"}
            className="py-7 pl-[65px] pr-[50px] w-[497px] rounded-lg border border-solid border-[#B8BACF] outline-none"
          />
          {passwordshow ? (
            <AiFillEyeInvisible
              onClick={() => setPasswordShow(false)}
              className="absolute right-[50px] top-[30px] text-xl"
            />
          ) : (
            <AiFillEye
              onClick={() => setPasswordShow(true)}
              className="absolute right-[50px] top-[30px] text-xl"
            />
          )}
          <h4 className="font-nunito font-semibold text-xl text-white w-[497px] rounded-lg absolute bottom-[-31px] left-0 pl-3 bg-red-600 mt-1.5">
            {passworderr}
          </h4>
        </div>
        <div className="relative">
          {!loader ? (
            <button
              onClick={handleSubmit}
              className="bg-primary py-5 px-[220px] rounded-[86px] mt-12 font-nunito font-semibold text-white text-xl"
            >
              Sign up
            </button>
          ) : (
            <div className="mt-12 w-[509px] px-[220px] bg-primary rounded-[86px]">
              <ColorRing
                visible={true}
                height="68"
                width="68"
                ariaLabel="blocks-loading"
                wrapperStyle={{}}
                wrapperClass="blocks-wrapper"
                colors={["#fff", "#fff", "#fff", "#fff", "#fff"]}
              />
            </div>
          )}
          <p className="text-center font-nunito font-regular text-themes text-sm mt-9">
            Already have an account?
            <Link
              to={"/login"}
              className="font-nunito font-bold text-red-600 text-lg ml-1.5"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registration;
