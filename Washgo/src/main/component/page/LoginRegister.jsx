import React, { useState } from "react";
import Login from "../common/Login"; // Already styled
import Register from "../common/Register"; // Already styled

function LoginRegister() {
  const [loginOrResgister, setLoginOrRegister] = useState(true);

  const handeleSignup = () => {
    setLoginOrRegister(!loginOrResgister);
  };

  // This component simply switches between Login and Register.
  // The actual visual styling (background, centering, forms)
  // is handled within the Login and Register components themselves,
  // which we've already styled.
  return (
    <>
      {" "}
      {/* Using a React Fragment is good here, avoids adding extra divs */}
      {loginOrResgister ? (
        <Login signup={handeleSignup} />
      ) : (
        <Register signin={handeleSignup} />
      )}
    </>
  );
}

export default LoginRegister;
