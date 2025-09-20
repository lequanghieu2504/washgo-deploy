import React, { useEffect } from "react";

export default function LoginWithGoogle() {
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      google.accounts.id.initialize({
        client_id:
          "453562513505-qscvqm3pklsm18j3qu75u0d55qvu38hp.apps.googleusercontent.com",
        callback: handleCredentialResponse,
      });

      google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        {
          theme: "outline",
          size: "large",
        }
      );

      google.accounts.id.prompt();
    };

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.body.appendChild(script);
  }, []);

  function handleCredentialResponse(response) {
    const token = response.credential;
    console.log("Encoded JWT ID token: " + token);

    const payload = JSON.parse(atob(token.split(".")[1]));
    const googleId = payload.sub;
    fetch("http://localhost:8080/auth/login-google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ googleId }),
    })
      .then((res) => res.text())
      .then((message) => {
        console.log("this is message: ", message);
      })
      .catch(console.error);
  }

  return (
    <>
      <div>
        <div id="googleSignInDiv"></div>
      </div>
    </>
  );
}
