import { Navigate } from "react-router-dom";

function ProtectedRoute({
  children,
  allowedRoles = [],
}) {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  const savedRole = localStorage.getItem("role");

  console.log("========== PROTECTED ROUTE ==========");
  console.log("Token:", !!token);
  console.log("Saved Role:", savedRole);
  console.log("User:", userString);

  // Not logged in
  if (!token || !userString) {
    console.log("No authentication -> LOGIN");

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  let user;

  try {
    user = JSON.parse(userString);
  } catch (error) {
    console.error(
      "Invalid user data:",
      error
    );

    localStorage.clear();

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // Get role
  let role =
    savedRole ||
    user.role ||
    "";

  role = role
    .replace("ROLE_", "")
    .toUpperCase();

  console.log("ProtectedRoute Role:", role);
  console.log(
    "Allowed Roles:",
    allowedRoles
  );

  // Normalize allowed roles
  const normalizedAllowedRoles =
    allowedRoles.map((item) =>
      item
        .replace("ROLE_", "")
        .toUpperCase()
    );

  console.log(
    "Normalized Allowed Roles:",
    normalizedAllowedRoles
  );

  // If no role restriction
  if (normalizedAllowedRoles.length === 0) {
    return children;
  }

  // Check permission
  if (
    !normalizedAllowedRoles.includes(role)
  ) {
    console.log(
      "❌ ACCESS DENIED"
    );

    console.log(
      "Current Role:",
      role
    );

    console.log(
      "Required:",
      normalizedAllowedRoles
    );

    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  console.log("✅ ACCESS GRANTED");

  return children;
}

export default ProtectedRoute;