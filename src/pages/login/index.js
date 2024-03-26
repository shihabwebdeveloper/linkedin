import React, { useEffect, useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { ColorRing } from "react-loader-spinner";
import { ToastContainer, toast } from "react-toastify";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { userLoginInfo } from "../../slices/userSlice";

const Login = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  let [email, setEmail] = useState("");
  let [password, setPassword] = useState("");
  let [emailerr, setEmailerr] = useState("");
  let [passworderr, setPassworderr] = useState("");
  let [passwordshow, setPasswordShow] = useState(false);
  let [loader, setLoader] = useState(false);
  const data = useSelector((state) => state.userLoginInfo.userInfo);

  let handleEmail = (e) => {
    setEmail(e.target.value);
    setEmailerr("");
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
    if (!password) {
      setPassworderr("Password is requird");
    } else {
      if (!/^(?=.{6,})/.test(password)) {
        setPassworderr("Password must be 6 character or longer");
      }
    }
    if (
      email &&
      password &&
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) &&
      /^(?=.{6,})/.test(password) &&
      !data
    ) {
      setLoader(true);
      signInWithEmailAndPassword(auth, email, password)
        .then((user) => {
          dispatch(userLoginInfo(user.user));
          localStorage.setItem("userInfo", JSON.stringify(user.user));
          toast.success("Login success full");
          setEmail("");
          setPassword("");
          setTimeout(() => {
            navigate("/");
          }, 2000);
          setLoader(false);
        })
        .catch((error) => {
          if (error.code.includes("auth/user-not-found")) {
            setEmailerr("Email not found");
          }
          if (error.code.includes("auth/wrong-password")) {
            setPassworderr("Password is incorrect");
          }
          setLoader(false);
        });
    } else {
      setPassworderr("You have already logged in. You have to log out first")
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
      <div className="mt-20">
        <img className="mx-auto" src="images/logo.png" />
        <div>
          <h2 className="font-nunito font-bold text-4xl text-themes text-center mt-11">
            Login
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
              Sign in
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
            Dont have an account?
            <Link
              to={"/registration"}
              className="font-nunito font-bold text-red-600 text-lg ml-1.5"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
