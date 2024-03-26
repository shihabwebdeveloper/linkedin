import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cropper from "react-cropper";
import {
  getStorage,
  uploadString,
  ref as Stref,
  getDownloadURL,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import {
  getDatabase,
  push,
  ref as dbref,
  set,
  onValue,
  remove,
} from "firebase/database";

const ProjectModal = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState();
  const [cropData, setCropData] = useState("#");
  const [cropper, setCropper] = useState();
  const storage = getStorage();
  const auth = getAuth();
  const db = getDatabase();

  let [projectName, setProjectName] = useState("");

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

  let handleCancel = () => {
    navigate("/profile");
  };

  const getCropData = () => {
    if (typeof cropper !== "undefined") {
      setCropData(cropper.getCroppedCanvas().toDataURL());
      const storageRef = Stref(
        storage,
        "projectPhotos/" + uuidv4()
      );
      const message4 = cropper.getCroppedCanvas().toDataURL();
      uploadString(storageRef, message4, "data_url").then((snapshot) => {
        getDownloadURL(storageRef).then((downloadURL) => {
          set(push(dbref(db, "projectPhoto")), {
            projectPhoto: downloadURL,
            projectName: projectName,
            uid: auth.currentUser.uid,
          });
          navigate("/profile");
        });
      });
    }
  };

  return (
    <div className="h-full w-full bg-transparent absolute px-96 py-28 top-0 left-0 z-50">
      <div className="bg-primary h-[700px] p-2 rounded-md">
        <h1 className="font-nunito font-bold text-white text-2xl">
          Upload your project
        </h1>
        <div className="w-56 h-28 mt-2.5 overflow-hidden mx-auto">
          {image ? (
            <div className="img-preview w-56 h-28 rounded-full" />
          ) : (
            <img className="w-36 h-28" src="images/avatar.png" alt="" />
          )}
        </div>
        {image && (
          <Cropper
            className="mt-2"
            style={{ height: 200, width: "100%" }}
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
          onChange={(e) => handlePostPhotoPreview(e)}
          className="mt-2.5"
          type="file"
        />

        <br />
        <h2 className="font-nunito font-semibold text-white text-xl mt-2">
          Project Name
        </h2>
        <input
          onChange={(e) => setProjectName(e.target.value)}
          className="mt-2.5 px-2 py-1 w-96 mb-3 rounded-md outline-none"
          type="text"
          placeholder="Enter your project name"
        />
        <br />
        {image && (
          <button
            onClick={() => getCropData()}
            className="font-nunito font-semibold mt-2.5 text-white text-xl py-2 px-5 bg-green-600 rounded-lg mr-2"
          >
            Upload
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
  );
};

export default ProjectModal;
