import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FiSend } from "react-icons/fi";
import { MdOutlinePhoto } from "react-icons/md";
import {
  getDatabase,
  push,
  ref as dbref,
  set,
  onValue,
  remove,
} from "firebase/database";
import Cropper from "react-cropper";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import {
  getStorage,
  uploadString,
  ref as Stref,
  getDownloadURL,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { userLoginInfo } from "../../slices/userSlice";

const Home = () => {
  const db = getDatabase();
  const auth = getAuth();
  const storage = getStorage();
  const data = useSelector((state) => state.userLoginInfo.userInfo);
  const navigate = useNavigate();
  const [image, setImage] = useState();
  const [cropData, setCropData] = useState("#");
  const [cropper, setCropper] = useState();
  const dispatch = useDispatch();

  let [postInput, setPostInput] = useState("");
  let [bio, setBio] = useState("");
  let [allPost, setAllPost] = useState([]);
  let [userlist, setUserList] = useState([]);
  let [friendRequestList, setFriendRequestList] = useState([]);
  let [requestBlock, setRequestBlock] = useState([]);
  let [friend, setFriend] = useState([]);
  let [postPhotoModal, setPostPhotoModal] = useState(false);
  let [postDeleteModal, setPostDeleteModal] = useState(false);
  let [postPhoto, setPostPhoto] = useState("");
  let [verify, setVerify] = useState(true);

  const uid = data && data.uid;
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user.emailVerified) {
        dispatch(userLoginInfo(user));
        localStorage.setItem("userInfo", JSON.stringify(user));
        setVerify(true);
      }
    });
    if (!data) {
      navigate("/login");
    }
    if (!data.emailVerified) {
      setVerify(false);
    }

    const profileInfo = dbref(db, "profileinfo/" + uid);
    onValue(profileInfo, (snapshot) => {
      let proData = snapshot.val();
      setBio(proData && proData.bio);
    });

    const posts = dbref(db, "posts");
    onValue(posts, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        arr.push({
          ...item.val(),
          id: item.key,
        });
      });
      setAllPost(arr);
    });

    const friendRequest = dbref(db, "friendRequest");
    onValue(friendRequest, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        if (data.uid === item.val().recieverId) {
          arr.push({
            ...item.val(),
            id: item.key,
          });
        }
      });
      setFriendRequestList(arr);
    });

    const friendRequestRef = dbref(db, "friendRequest");
    onValue(friendRequestRef, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        arr.push(item.val().senderId + item.val().recieverId);
      });
      setRequestBlock(arr);
    });

    const friend = dbref(db, "friend");
    onValue(friend, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        arr.push(item.val().senderId + item.val().recieverId);
      });
      setFriend(arr);
    });

    const users = dbref(db, "users");
    onValue(users, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        if (data.uid !== item.key) {
          arr.push({ ...item.val(), userid: item.key });
        }
      });
      setUserList(arr);
    });
  }, [data, db, navigate]);

  let handlePostInput = (e) => {
    setPostInput(e.target.value);
  };

  let handleCancel = () => {
    setPostPhotoModal(false);
  };

  let handlePostPhotoModal = () => {
    setPostPhotoModal(true);
  };

  const handlePostPhotoPreview = (e) => {
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

  let handleFriendRequest = (item) => {
    set(push(dbref(db, "friendRequest/")), {
      senderName: data.displayName,
      senderId: data.uid,
      senderEmail: data.email,
      senderPhoto: data.photoURL,
      recieverName: item.username,
      recieverId: item.userid,
      recieverEmail: item.email,
    });
  };

  let handlePost = () => {
    if (postInput || postPhoto) {
      set(push(dbref(db, "posts/")), {
        whoPost: data && data.uid,
        whoPostName: data && data.displayName,
        whoPostPhoto: data && data.photoURL,
        whoPostBio: bio,
        post: postInput,
        postPhoto: postPhoto,
      }).then(() => {
        setPostInput("");
        setPostPhoto("");
      });
    }
  };

  let handlePostDelete = (item) => {
    remove(dbref(db, "posts/" + item.id));
    if (!postDeleteModal) {
      setPostDeleteModal(true);
    } else {
      setPostDeleteModal(false);
    }
  };

  let handlePostDeleteModal = () => {
    if (!postDeleteModal) {
      setPostDeleteModal(true);
    } else {
      setPostDeleteModal(false);
    }
  };

  let handleAcceptReq = (item) => {
    set(push(dbref(db, "friend/")), {
      ...item,
    }).then(remove(dbref(db, "friendRequest/" + item.id)));
  };

  let handleReject = (item) => {
    (remove(dbref(db, "friendRequest/" + item.id)))
  }

  let handleLogout = () => {
    signOut(auth).then(() => {
      dispatch(userLoginInfo(null));
      localStorage.removeItem("userInfo");
      navigate("/login");
    });
  };

  const getCropData = () => {
    if (typeof cropper !== "undefined") {
      setCropData(cropper.getCroppedCanvas().toDataURL());
      const storageRef = Stref(storage, "postsPhotos/" + uuidv4());
      const message4 = cropper.getCroppedCanvas().toDataURL();
      uploadString(storageRef, message4, "data_url").then((snapshot) => {
        getDownloadURL(storageRef).then((downloadURL) => {
          setPostPhoto(downloadURL);
          setPostPhotoModal(false);
          setImage("");
        });
      });
    }
  };

  return (
    <>
      {verify ? (
        <div className="bg-[#F7F9FB] h-full relative">
          <div className="flex bg-white">
            <div className="border-r border-solid border-#F4F4F4 py-6">
              <img className="px-10" src="images/logo.png" alt="logo" />
            </div>
            <div className="flex justify-end w-full">
              <input
                className="w-96 pl-16 pr-5 py-8 border-x boder-solid border-#F4F4F4"
                type="text"
                placeholder="Search"
              />
              <Link
                to={"/profile"}
                className="flex items-center pl-8 border-r border-solid border-#F4F4F4"
              >
                <img
                  className="w-11 h-11 rounded-full "
                  src={data && data.photoURL}
                  alt=""
                />
                <h2 className="font-barlow font-medium text-xs text-black ml-3.5">
                  {data && data.displayName}
                </h2>
                <p className="font-barlow font-regular text-xs text-#181818 ml-6 pr-32">
                  YOU
                </p>
              </Link>
              <div className="text-center px-7 border-r boder-solid border-#F4F4F4 mr-12">
                <button className="font-bold mt-1.5">...</button>
                <h3 className="font-barlow font-medium text-balck text-xs mt-2.5">
                  OTHER
                </h3>
              </div>
            </div>
          </div>

          <div className="mt-10 ml-36 w-[1310px]">
            <div className="border border-solid bg-white border-#F4F4F4 w-96 h-[450px] py-2 pl-1.5 overflow-y-auto absolute top-[130px] right-[50px]">
              <h1 className="font-barlow font-semibold text-black text-lg border-b border-solid border-#F4F4F4 pb-2">
                User list
              </h1>
              {userlist.map((item, index) => (
                <div className="mt-1.5 ml-1.5 mb-2 border-b border-solid border-#F4F4F4 flex py-1.5" key={index}>
                  <img
                    className="w-14 h-14 rounded-full"
                    src={
                      item.profilePhoto
                        ? item.profilePhoto
                        : "images/profile.png"
                    }
                    alt=""
                  />
                  <div className="ml-1.5">
                    <h1 className="font-barlow font-semibold text-xl text-black">
                      {item.username}
                    </h1>
                    <div>
                      <p className="font-barlow font-regular text-base w-[225px] text-black overflow-hidden hover:overflow-visible h-8">
                        {item.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex py-2">
                    {requestBlock.includes(item.userid + data.uid) ||
                    requestBlock.includes(data.uid + item.userid) ? (
                      <button className="font-barlow font-semibold text-xl text-white justify-end px-5 rounded-lg bg-green-600">
                        P
                      </button>
                    ) : friend.includes(item.userid + data.uid) ||
                      friend.includes(data.uid + item.userid) ? (
                      <button className="font-barlow font-semibold text-xl text-white justify-end px-5 rounded-lg bg-green-600">
                        F
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFriendRequest(item)}
                        className="font-barlow font-semibold text-xl text-white justify-end px-5 rounded-lg bg-primary hover:bg-green-600"
                        title="Add"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="border border-solid bg-white border-#F4F4F4 w-96 h-[450px] py-2 pl-1.5 overflow-y-auto absolute top-[600px] right-[50px]">
              <h1 className="font-barlow font-semibold text-black text-lg border-b border-solid border-#F4F4F4 pb-2">
                Friend request
              </h1>
              {friendRequestList.map((item) => (
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
                      <button
                        onClick={() => handleAcceptReq(item)}
                        className="font-nunito font-semibold text-base text-white bg-green-600 px-3 py-1 rounded-md mr-1.5"
                      >
                        Accept
                      </button>
                      <button onClick={()=>handleReject(item)} className="font-nunito font-semibold text-base text-white bg-red-600 px-3 py-1 rounded-md">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-7 bg-white rounded-md">
              {postPhotoModal && (
                <div className="h-full w-full bg-transparent absolute px-96 py-28 top-0 left-0 z-50">
                  <div className="bg-primary h-[700px] p-2 rounded-md">
                    <h1 className="font-nunito font-bold text-white text-2xl">
                      Upload your profile picture
                    </h1>
                    <div className="w-56 h-28 mt-2.5 overflow-hidden mx-auto">
                      {image ? (
                        <div className="img-preview w-56 h-28 rounded-full" />
                      ) : (
                        <img
                          className="w-36 h-28"
                          src="images/avatar.png"
                          alt=""
                        />
                      )}
                    </div>
                    {image && (
                      <Cropper
                        className="mt-2"
                        style={{ height: 400, width: "100%" }}
                        zoomTo={0.5}
                        initialAspectRatio={2}
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
                      onChange={(e) => handlePostPhotoPreview(e)}
                      className="mt-2.5"
                      type="file"
                    />

                    <br />
                    {image && (
                      <button
                        onClick={() => getCropData()}
                        className="font-nunito font-semibold mt-2.5 text-white text-xl py-2 px-5 bg-green-600 rounded-lg mr-2"
                      >
                        Select
                      </button>
                    )}
                    {image ? (
                      <button
                        onClick={() => handleCancel()}
                        className="font-nunito font-semibold mt-2.5 text-white text-xl py-2 px-5 bg-red-600 rounded-lg"
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCancel()}
                        className="font-nunito font-semibold mt-2.5 text-white text-xl py-1 px-6 bg-red-600 rounded-lg"
                      >
                        Back
                      </button>
                    )}
                  </div>
                </div>
              )}
              <h2 className="font-barlow font-medium text-xs text-black pb-4 border-b border-solid border-#F4F4f4">
                NEW POST
              </h2>
              <div className="relative">
                <input
                  value={postInput}
                  onChange={(element) => handlePostInput(element)}
                  className="w-full h-20 outline-none pr-28"
                  type="text"
                  placeholder="What's on your mind"
                />
                <div className="flex items-center absolute top-3.5 right-0">
                  <MdOutlinePhoto
                    onClick={() => handlePostPhotoModal()}
                    className="text-4xl"
                  />
                  <FiSend
                    onClick={() => handlePost()}
                    className="text-5xl ml-2.5 bg-primary text-white p-3 rounded-lg"
                  />
                </div>
              </div>
            </div>
            {allPost.map((item, index) => (
              <div key={index} className="p-7 bg-white mt-9 rounded-md">
                {data.uid === item.whoPost && (
                  <>
                    {!postDeleteModal ? (
                      <div className="w-full flex justify-end">
                        <button
                          onClick={handlePostDeleteModal}
                          className="text-xl font-bold"
                        >
                          ...
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end w-full">
                        <button
                          onClick={() => handlePostDelete(item)}
                          className="text-xl font-semibold text-white py-1.5 px-3 rounded-md mr-1.5 bg-red-600"
                        >
                          Delete
                        </button>
                        <button
                          onClick={handlePostDeleteModal}
                          className="text-xl font-semibold text-white py-1.5 px-3 rounded-md bg-green-600"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </>
                )}
                <div className="border-t border-solid border-#F4F4F4 mt-5">
                  <div className="flex mt-4">
                    <img
                      className="w-14 h-14 rounded-full"
                      src={item.whoPostPhoto}
                      alt=""
                    />
                    <div className="ml-4">
                      <h1 className="font-barlow font-bold text-black text-lg">
                        {item.whoPostName}
                      </h1>
                      <p className="font-barlow font-regular text-black text-xs">
                        {item.whoPostBio}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 w-full">
                    <p className="font-barlow font-regular text-black text-lg">
                      {item.post}
                    </p>
                  </div>
                  <div className="w-full mt-4 pb-16">
                    <img
                      className="w-full rounded-sm"
                      src={item.postPhoto}
                      alt=""
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="w-full bg-#F4F6FA">
            <div className="mt-10 flex justify-between ml-36 py-9 w-[1310px]">
              <div>
                <img className="w-14 h-14" src="images/logo.png" alt="" />
                <h3 className="font-barlow font-semibold text-lg text-black">
                  Linked
                  <span className="text-primary font-barlow font-semibold text-lg">
                    In
                  </span>
                </h3>
              </div>
              <div>
                <p className="font-barlow font-normal text-lg text-black">Talent Solutions</p>
                <p className="font-barlow font-normal text-lg text-black mt-2">Marketing Solutions</p>
                <p className="font-barlow font-normal text-lg text-black mt-2">Sales Solutions</p>
                <p className="font-barlow font-normal text-lg text-black mt-2">Safery Solutions</p>
              </div>
              <div>
                <p className="font-barlow font-normal text-lg text-black">Community Guidelines</p>
                <p className="font-barlow font-normal text-lg text-black mt-2">Privacy & Tearms</p>
                <p className="font-barlow font-normal text-lg text-black mt-2">Mobile App</p>
              </div>
              <div className="text-center flex flex-col justify-center items-center">
                <button
                  onClick={handleLogout}
                  className="font-barlow  mt-1.5 font-semibold font-xl py-2 px-5 bg-primary text-white rounded-md"
                >
                  Logout
                </button>
                <button
                  className="font-barlow  mt-1.5 font-semibold font-xl py-1.5 px-4 bg-transparent text-primary border-primary border rounded-md"
                >
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-screen">
          <div className="font-barlow font-extrabold text-7xl text-black">
            Please Verify your email
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
