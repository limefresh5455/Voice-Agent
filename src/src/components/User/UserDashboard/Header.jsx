import React from "react";
import { useAppContext } from "../../Context/AppContext";

export const Header = () => {
  const { user } = useAppContext();
  return (
    <>
      <nav className=" navbar-expand-lg navbar-light  d-flex align-items-center nav-chat px-2">
        <div className="d-flex align-items-center">
          <a className="nav-link text-secondary fw-bold ms-3" href="#">
            <img
              src="../../../assets/image/profileicon.jpg"
              alt="img"
              className="img-fluid profile_img"
            />
          </a>
          <span className="person_name">
            {user?.name
              ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
              : "User"}
          </span>
        </div>
      </nav>
    </>
  );
};
