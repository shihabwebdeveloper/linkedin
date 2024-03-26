import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import "cropperjs/dist/cropper.css";
import { getAuth, } from "firebase/auth";
import { getDatabase, ref, set, onValue } from "firebase/database";

const Editpro = () => {
  const auth = getAuth();
  const db = getDatabase();
  const data = useSelector((state) => state.userLoginInfo.userInfo);
  const navigate = useNavigate();

  let [about, setAbout] = useState("");
  let [bio, setBio] = useState("");
  let [location, setLocation] = useState("");
  let [number, setNumber] = useState("");
  let [skill, setSkill] = useState("");
  let [skillTime, setSkillTime] = useState("");
  let [skillDescription, setSkillDescription] = useState("");
  let [college, setCollege] = useState("");
  let [collegeSubject, setCollegeSubject] = useState("");
  let [collegeDescription, setCollegeDescription] = useState("");

  let handleAbout = (e) => {
    setAbout(e.target.value);
  };
  let handleBio = (e) => {
    setBio(e.target.value);
  };
  
  let handleLocation = (e) => {
    setLocation(e.target.value);
  };
  let handleNumber = (e) => {
    setNumber(e.target.value);
  };
  let handleSkill = (e) => {
    setSkill(e.target.value);
  };
  let handleSkillTime = (e) => {
    setSkillTime(e.target.value);
  };
  let handleSkillDescription = (e) => {
    setSkillDescription(e.target.value);
  };
  let handleCollege = (e) => {
    setCollege(e.target.value);
  };
  let handleCollegeSubject = (e) => {
    setCollegeSubject(e.target.value);
  };
  let handleCollegeDescription = (e) => {
    setCollegeDescription(e.target.value);
  };

  let handleSubmit = () => {
    set(ref(db, "profileinfo/" + auth.currentUser.uid), {
      about: about,
      bio: bio,
      location: location,
      number: number,
      skill: skill,
      skillTime: skillTime,
      skillDescription: skillDescription,
      college: college,
      collegeSubject: collegeSubject,
      collegeDescription: collegeDescription,
    });
    setAbout("");
    navigate("/profile");
  };

  useEffect(() => {
    if (!data) {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    const uid = data && data.uid;
    const profileInfo = ref(db, "profileinfo/" + uid);
    onValue(profileInfo, (snapshot) => {
      const proData = snapshot.val();
      setAbout(proData.about);
      setBio(proData.bio);
      setNumber(proData.number);
      setLocation(proData.location);
      setSkill(proData.skill);
      setSkillTime(proData.skillTime);
      setSkillDescription(proData.skillDescription);
      setCollege(proData.college);
      setCollegeSubject(proData.collegeSubject);
      setCollegeDescription(proData.collegeDescription);
    });
  }, []);

  return (
    <div className="h-full w-full bg-[#F7F9FB] absolute top-0 z-50 left-0">
      <div className="flex bg-white">
        <div className="border-r border-solid border-#F4F4F4 py-6">
          <img className="px-10" src="images/logo.png" />
        </div>
        <div className="flex justify-end w-full">
          <div className="flex items-center pl-8 border-r border-solid border-#F4F4F4">
            <img className="w-11 h-11 rounded-full" src={data.photoURL} />
            <h2 className="font-barlow font-medium text-xs text-black ml-3.5">
              {data.displayName}
            </h2>
            <p className="font-barlow font-regular text-xs text-#181818 ml-6 pr-32">
              YOU
            </p>
          </div>
          <Link
            to={"/profile"}
            className="text-center px-7 border-r boder-solid border-#F4F4F4 mr-12"
          >
            <button className="font-bold mt-1.5">
              <IoMdArrowRoundBack className="mt-2.5" />
            </button>
            <h3 className="font-barlow font-medium text-balck text-xs">Back</h3>
          </Link>
        </div>
      </div>
      <div className="m-5 bg-white">
        <div className="mt-5 pl-2.5 border-x border-t border-solid border-gray-300 py-1">
          <h1 className="font-barlow font-bold text-black text-xl">
            About yourself
          </h1>
          <input
            value={about}
            onChange={handleAbout}
            className="pl-2.5 w-96 border-solid border border-gray-400 py-6 mt-2.5"
            type="text"
            placeholder="Write about yourself"
          />
          <h3 className="font-barlow font-medium text-black text-sm mt-2">
            Edit Bio
          </h3>
          <input
            value={bio}
            onChange={handleBio}
            className="mt-2.5 pl-2.5 w-52 border-solid border border-gray-400 py-2 mt-2.5"
            type="text"
            maxLength="30"
          />
          <h3 className="font-barlow font-medium text-black text-sm mt-2">
            Your location
          </h3>
          <input
            value={location}
            onChange={handleLocation}
            className="mt-2.5 pl-2.5 w-52 border-solid border border-gray-400 py-2 mt-2.5"
            type="text"
            maxLength="30"
          />
          <h3 className="font-barlow font-medium text-black text-sm mt-2">
            Your Contact Number
          </h3>
          <input
            value={number}
            onChange={handleNumber}
            className="mt-2.5 pl-2.5 w-52 border-solid border border-gray-400 py-2 mt-2.5"
            type="number"
            maxLength="30"
          />
        </div>
        <div className="mt-5 pl-2.5 border-x border-solid border-gray-300 py-1">
          <div className="mt-5">
            <h1 className="font-barlow font-bold text-black text-xl">
              Your Experience info
            </h1>
            <h3 className="font-barlow font-medium text-black text-sm">
              Skill name
            </h3>
            <input
              value={skill}
              onChange={handleSkill}
              className="mt-2.5 pl-2.5 w-52 border-solid border border-gray-400 py-2 mt-2.5"
              type="text"
              maxLength="30"
            />
            <h3 className="font-barlow font-medium text-black text-sm">
              Years of experience
            </h3>
            <input
              value={skillTime}
              onChange={handleSkillTime}
              className="mt-2.5 pl-2.5 w-52 border-solid border border-gray-400 py-2 mt-2.5"
              type="text"
              maxLength="30"
            />
            <h3 className="font-barlow font-medium text-black text-sm">
              Description
            </h3>
            <input
              value={skillDescription}
              onChange={handleSkillDescription}
              className="mt-2.5 pl-2.5 w-52 border-solid border border-gray-400 py-2 mt-2.5"
              type="text"
              maxLength="30"
            />
          </div>
        </div>
        <div className="mt-5 pl-2.5 border-x border-b border-solid border-gray-300 py-1">
          <div className="mt-5">
            <h1 className="font-barlow font-bold text-black text-xl">
              Your Education info
            </h1>
            <h3 className="font-barlow font-medium text-black text-sm">
              School/College name
            </h3>
            <input
              value={college}
              onChange={handleCollege}
              className="mt-2.5 pl-2.5 w-52 border-solid border border-gray-400 py-2 mt-2.5"
              type="text"
              maxLength="30"
            />
            <h3 className="font-barlow font-medium text-black text-sm">
              Your subject
            </h3>
            <input
              value={collegeSubject}
              onChange={handleCollegeSubject}
              className="mt-2.5 pl-2.5 w-52 border-solid border border-gray-400 py-2 mt-2.5"
              type="text"
              maxLength="30"
            />
            <h3 className="font-barlow font-medium text-black text-sm">
              Description
            </h3>
            <input
              value={collegeDescription}
              onChange={handleCollegeDescription}
              className="mt-2.5 pl-2.5 w-52 border-solid border border-gray-400 py-2 mt-2.5"
              type="text"
              maxLength="30"
            />
            <br />
            <button
              onClick={handleSubmit}
              className="font-nunito font-bold text-lg text-white mt-2.5 bg-green-600 py-2 px-5 rounded-lg mr-2"
            >
              Submit
            </button>
            <Link
              to={"/profile"}
              className="font-nunito font-bold text-lg text-white mt-2.5 bg-red-600 py-2 px-5 rounded-lg"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editpro;
