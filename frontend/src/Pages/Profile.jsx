import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../css/UserDashboard.css";

function Profile({ user, setUser }) {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] =
    useState(user || null);

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
      return;
    }

    try {
      const storedUser =
        localStorage.getItem("user");

      if (storedUser) {
        const parsedUser =
          JSON.parse(storedUser);

        setCurrentUser(parsedUser);

        if (setUser) {
          setUser(parsedUser);
        }
      } else {
        navigate("/login");
      }
    } catch {
      navigate("/login");
    }
  }, [user, setUser, navigate]);

  if (!currentUser) {
    return (
      <div className="loading-container">
        Loading...
      </div>
    );
  }

  return (
    <div className="dashboard-container">

      <h2>
        Welcome,{" "}

        {currentUser?.name ||
          currentUser?.email ||
          "User"}
      </h2>

      <div className="dashboard-card">

        <h3>
          User Profile
        </h3>

        <p>
          <strong>Name:</strong>{" "}

          {currentUser?.name ||
            "Not Available"}
        </p>

        <p>
          <strong>Email:</strong>{" "}

          {currentUser?.email ||
            "Not Available"}
        </p>

        <p>
          <strong>Role:</strong>{" "}

          {currentUser?.role ||
            "USER"}
        </p>

      </div>

    </div>
  );
}

export default Profile;