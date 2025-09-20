import { FaUserCircle, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Footer from "@/layouts/components/UserFooter";

export default function GuestProfile() {
  const navigate = useNavigate();

  console.log("Rendering GuestProfile page");

  return (
    <div className="min-h-screen bg-gray-50  pb-16">
      <div className="bg-[#cc0000] text-white px-4 pt-[env(safe-area-inset-top)] pb-4">
        <h2 className="text-2xl font-semibold text-center">Profile</h2>
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 mr-2"
            aria-label="Go back"
          >
            <FaArrowLeft className="text-2xl" />
          </button>

          {/* User Info */}
          <FaUserCircle className="text-5xl text-white" />
          <div className="flex-1 ml-4">
            <p className="text-lg font-medium">Username</p>
            <p className="text-sm opacity-80">Gmail</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-1 rounded-lg bg-white text-[#cc0000] font-semibold border border-white shadow hover:bg-[#cc0000] hover:text-white transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-3 py-1 rounded-lg border border-white text-white font-semibold shadow hover:bg-white hover:text-[#cc0000] transition"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>

      {/* Guest illustration and prompt */}
      <div className="mx-5 mt-8 rounded-2xl bg-gray-50 flex flex-col items-center justify-center p-6 min-h-[340px]">
        <img
          src="src\assets\images\require-login.png"
          alt="Guest illustration"
          className="w-full max-w-[420px] h-auto mb-6 rounded-xl object-contain p-2"
          draggable={false}
        />
        <p className="text-center text-gray-700 text-xl font-semibold mb-3">
          You are currently browsing as a guest.
        </p>
        <p className="text-center text-gray-600 text-lg">
          Log in or create an account to access your profile and more features!
        </p>
      </div>
    </div>
  );
}
