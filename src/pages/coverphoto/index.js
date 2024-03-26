import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Cropper from "react-cropper";
import { getAuth, signOut, updateProfile } from "firebase/auth";
import { getDatabase, ref, update } from "firebase/database";
import { getStorage, uploadString,ref as Stref, getDownloadURL } from "firebase/storage";
import { userLoginInfo } from "../../slices/userSlice";

const CoverPhoto = () => {
    const auth = getAuth();
  const db = getDatabase();
  const navigate = useNavigate();
  const storage = getStorage();
  let dispatch = useDispatch();
  const data = useSelector((state) => state.userLoginInfo.userInfo);

  const [image, setImage] = useState();
  const [cropData, setCropData] = useState("#");
  const [cropper, setCropper] = useState();

  const handleCoverPreview = (e) => {
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

  let handleCancel = () => {
    navigate("/profile");
    setImage("");
  };

  const getCropData = () => {
    if (typeof cropper !== "undefined") {
        setCropData(cropper.getCroppedCanvas().toDataURL());
        console.log(auth.currentUser.uid)
        const storageRef = Stref(storage, "coverPhoto/" + auth.currentUser.uid);
        const message4 = cropper.getCroppedCanvas().toDataURL();
        uploadString(storageRef, message4, "data_url").then((snapshot) => {
        getDownloadURL(storageRef).then((downloadURL) => {
          updateProfile(auth.currentUser, {
            coverPhoto: downloadURL,
          }).then(() => {
            const users = ref(db, "users/" + data.uid);
            update(users, { coverPhoto: downloadURL });
            dispatch(userLoginInfo(auth.currentUser));
            localStorage.setItem("userInfo", JSON.stringify(auth.currentUser));
            setImage("");
            navigate("/profile");
          });
        });
      });
    }
  };

  return (
    <div className="h-full w-full bg-white absolute px-96 py-28 top-0 left-0 z-50">
      <div className="bg-primary h-[700px] p-2 rounded-md">
        <h1 className="font-nunito font-bold text-white text-2xl">
          Upload your cover picture
        </h1>
        <div className="w-28 h-28 rounded-full mt-2.5 overflow-hidden mx-auto">
          {image ? (
            <div className="img-preview w-28 h-28 rounded-full" />
          ) : (
            <img className="w-28 h-28 rounded-full" src="images/avatar.png" />
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
        <input onChange={handleCoverPreview} className="mt-2.5" type="file" />

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
  );
};

export default CoverPhoto;
