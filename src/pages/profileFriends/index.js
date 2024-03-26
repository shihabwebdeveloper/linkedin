import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FiEdit } from "react-icons/fi";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { FaLocationArrow } from "react-icons/fa";
import Cropper from "react-cropper";
import {
  getStorage,
  uploadString,
  ref as Stref,
  getDownloadURL,
} from "firebase/storage";
import { getAuth, signOut, updateProfile } from "firebase/auth";
import { getDatabase, ref, onValue, set, update } from "firebase/database";
import { userLoginInfo } from "../../slices/userSlice";

const ProfileFriends = ({ active }) => {
  const auth = getAuth();
  const db = getDatabase();
  const navigate = useNavigate();
  const storage = getStorage();
  const data = useSelector((state) => state.userLoginInfo.userInfo);
  const [image, setImage] = useState();
  const [cropData, setCropData] = useState("#");
  const [cropper, setCropper] = useState();
  let dispatch = useDispatch();

  let [profilemodal, setProfileModal] = useState(false);
  let email = data.email;
  let [about, setAbout] = useState("");
  let [bio, setBio] = useState("");
  let [location, setLocation] = useState("");
  let [number, setNumber] = useState("");
  let [contact, setContact] = useState(false);
  let [coverPhoto, setCoverPhoto] = useState("");
  let [friendList, setFriendList] = useState([]);

  useEffect(() => {
    const uid = data && data.uid;
    const profileInfo = ref(db, "profileinfo/" + uid);
    onValue(profileInfo, (snapshot) => {
      let proData = snapshot.val();
      setAbout(proData.about);
      setBio(proData.bio);
      setNumber(proData.number);
      setLocation(proData.location);
    });
  }, []);

  useEffect(() => {
    if (!data) {
      navigate("/login");
    }

    const users = ref(db, "users");
    onValue(users, (snapshot) => {
      snapshot.forEach((item) => {
        if (item.key == data.uid) {
          setCoverPhoto(item.val().coverPhoto);
        }
      });
    });

    const friends = ref(db, "friend");
    onValue(friends, (snapshot) => {
      snapshot.forEach((item) => {
        let arr = [];
        if (item.val().recieverId == data.uid) {
          arr.push(item.val());
        }
        setFriendList(arr);
      });
    });
  }, []);

  let handleContact = () => {
    if (contact) {
      setContact(false);
    } else {
      setContact(true);
    }
  };

  let handleLogout = () => {
    signOut(auth).then(() => {
      dispatch(userLoginInfo(null));
      localStorage.removeItem("userInfo");
      navigate("/login");
    });
  };
  let handleProfilePicUpload = () => {
    setProfileModal(true);
  };
  let handleCancel = () => {
    setProfileModal(false);
    setImage("");
  };

  const handleProfilePreview = (e) => {
    e.preventDefault();
    let files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(files[0]);
  };

  const getCropData = () => {
    if (typeof cropper !== "undefined") {
      setCropData(cropper.getCroppedCanvas().toDataURL());
      const storageRef = Stref(storage, "profile/" + auth.currentUser.uid);
      const message4 = cropper.getCroppedCanvas().toDataURL();
      uploadString(storageRef, message4, "data_url").then((snapshot) => {
        getDownloadURL(storageRef).then((downloadURL) => {
          updateProfile(auth.currentUser, {
            photoURL: downloadURL,
          }).then(() => {
            const users = ref(db, "users/" + data.uid);
            update(users, { profilePhoto: downloadURL });
            dispatch(userLoginInfo(auth.currentUser));
            localStorage.setItem("userInfo", JSON.stringify(auth.currentUser));
            setProfileModal(false);
            setImage("");
          });
        });
      });
    }
  };

  return (
    <div className="bg-[#F7F9FB] h-full relative">
      {/* Navbar */}
      <div className="flex bg-white">
        <div className="border-r border-solid border-#F4F4F4 py-6">
          <img className="px-10" src="images/logo.png" />
        </div>
        <div className="flex justify-end w-full">
          <input
            className="w-96 pl-16 pr-5 py-8 border-x boder-solid border-#F4F4F4"
            type="text"
            placeholder="Search"
          />
          <Link
            to={"/"}
            className="flex items-center px-8 border-r border-solid border-#F4F4F4"
          >
            <button className="font-barlow font-semibold text-base">
              Home
            </button>
          </Link>
          <div className="flex items-center pl-8 border-r border-solid border-#F4F4F4">
            <img className="w-11 h-11 rounded-full " src={data.photoURL} />
            <h2 className="font-barlow font-medium text-xs text-black ml-3.5">
              {data.displayName}
            </h2>
            <p className="font-barlow font-regular text-xs text-#181818 ml-6 pr-32">
              YOU
            </p>
          </div>
          <div className="text-center px-7 border-r boder-solid border-#F4F4F4 mr-12">
            <button className="font-bold mt-1.5">...</button>
            <h3 className="font-barlow font-medium text-balck text-xs mt-2.5">
              OTHER
            </h3>
          </div>
        </div>
      </div>
      {/* Navbar end */}

      <div className="mt-10 ml-36 w-[1310px]">
        <div className="relative">
          <img
            className="w-full h-[400px]"
            src={coverPhoto ? coverPhoto : "images/coverphoto.png"}
          />
          <Link
            to={"/editprofile"}
            className="absolute top-5 right-14 flex bg-white py-2.5 px-2.5 rounded-lg hover:border hover:border-solid hover:border-black duration-200"
          >
            <FiEdit className="mr-3.5 mt-1.5" />
            Edit Profile
          </Link>
          <Link
            to={"/coverphoto"}
            className="absolute top-[75px] right-14 flex bg-white py-2.5 px-2.5 rounded-lg hover:border hover:border-solid hover:border-black duration-200"
          >
            <FiEdit className="mr-3.5 mt-1.5" />
            Edit CoverPhoto
          </Link>
        </div>
        <div className="flex bg-white relative rounded-b-md">
          <div
            onClick={handleProfilePicUpload}
            className="bg-black w-[180px] h-[180px] rounded-full absolute top-[-24px] left-[38px] z-20 flex justify-center items-center opacity-0 hover:opacity-30"
          >
            <AiOutlineCloudUpload className="text-white text-4xl" />
          </div>
          <img
            className="w-[200px] h-[200px] rounded-full ml-7 mt-[-35px] z-10"
            src={data.photoURL}
          />
          <div className="pr-10 ml-7">
            <h1 className="font-barlow font-bold text-black text-xl flex w-full mt-7">
              {data.displayName}
              <img className="ml-5 mt-2 w-4 h-4" src="images/logoy.png" />
              <p className="flex ml-[400px] font-barlow font-regular text-xs leading-normal">
                <FaLocationArrow className="mr-2 text-primary" />
                {location}
              </p>
            </h1>
            <p className="font-barlow font-regular text-black text-base leading-normal mt-3 w-[600px]">
              {bio}
            </p>
            <button
              onClick={handleContact}
              className="font-barlow font-medium text-black text-sm mr-2.5 bg-primary hover:bg-green-600 duration-150 hover:text-white rounded-lg py-2.5 px-12 mt-4 mb-9"
            >
              Contact info
            </button>
            {contact && (
              <button className="font-barlow font-semibold text-black text-sm rounded-lg px-2.5 mt-[-10px] mb-9">
                {email}
                <br />
                <span>{number}</span>
              </button>
            )}
          </div>
        </div>
        <div className="mt-8">
          <Link
            to="/profile"
            className="border border-solid border-#F4F4F4 py-3.5 px-28 rounded-tr-md bg-white"
          >
            Profile
          </Link>
          <button className="border border-solid border-#F4F4F4 py-3.5 px-28 rounded-tr-md bg-white">
            Post
          </button>
          <button
            active="friends"
            className={
              active == "friends"
                ? "border border-solid border-#F4F4F4 py-3.5 px-28 rounded-tr-md bg-white"
                : "px-24 py-5 bg-primary rounded-t-md font-barlow font-medium"
            }
          >
            Friends
          </button>
        </div>
        <div className="px-8 bg-white mt-8 rounded-md pb-9">
          <div className="w-full py-2 pl-1.5 overflow-y-auto">
            <h1 className="font-barlow font-semibold text-black text-lg pb-2">
              Friend List
            </h1>
            {friendList.map((item) => (
              <div className="border-b border-solid border-#F4F4F4 mt-1.5 ml-1.5 mb-2 flex py-1.5">
                <img
                  className="w-14 h-14 rounded-full"
                  src={item.senderPhoto}
                  alt=""
                />
                <div className="w-full ml-2">
                  <h1 className="font-barlow font-semibold text-xl text-black">
                    {item.senderName}
                  </h1>
                  <div>
                    <p className="font-barlow font-regular text-base w-full text-black overflow-hidden hover:overflow-visible h-8">
                      {item.senderEmail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full bg-#F4F6FA">
          <div className="mt-10 flex ml-36 py-9 w-[1310px]">
            <div>
              <img className="w-14 h-14" src="images/logo.png" alt="" />
              <h3 className="font-barlow font-semibold text-lg text-black">
                Linked
                <span className="text-primary font-barlow font-semibold text-lg">
                  In
                </span>
              </h3>
            </div>
            <div className=" w-full text-center">
              <button
                onClick={handleLogout}
                className="font-barlow mt-1.5 font-semibold font-xl py-2 px-5 bg-primary text-white rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      {profilemodal && (
        <div className="h-full w-full bg-white absolute px-96 py-28 top-0 left-0 z-50">
          <div className="bg-primary h-[700px] p-2 rounded-md">
            <h1 className="font-nunito font-bold text-white text-2xl">
              Upload your profile picture
            </h1>
            <div className="w-28 h-28 rounded-full mt-2.5 overflow-hidden mx-auto">
              {image ? (
                <div className="img-preview w-28 h-28 rounded-full" />
              ) : (
                <img
                  className="w-28 h-28 rounded-full"
                  src="images/avatar.png"
                />
              )}
            </div>
            {image && (
              <Cropper
                className="mt-2"
                style={{ height: 400, width: "100%" }}
                zoomTo={0.5}
                initialAspectRatio={1}
                preview=".img-preview"
                src={image}
                viewMode={1}
                minCropBoxHeight={10}
                minCropBoxWidth={10}
                background={false}
                responsive={true}
                autoCropArea={1}
                checkOrientation={false}
                onInitialized={(instance) => {
                  setCropper(instance);
                }}
                guides={true}
              />
            )}
            <input
              onChange={handleProfilePreview}
              className="mt-2.5"
              type="file"
            />

            <br />
            {image && (
              <button
                onClick={getCropData}
                className="font-nunito font-semibold mt-2.5 text-white text-xl py-2 px-5 bg-green-600 rounded-lg mr-2"
              >
                Upload
              </button>
            )}
            {image ? (
              <button
                onClick={handleCancel}
                className="font-nunito font-semibold mt-2.5 text-white text-xl py-2 px-5 bg-red-600 rounded-lg"
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={handleCancel}
                className="font-nunito font-semibold mt-2.5 text-white text-xl py-1 px-6 bg-red-600 rounded-lg"
              >
                Back
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileFriends;
