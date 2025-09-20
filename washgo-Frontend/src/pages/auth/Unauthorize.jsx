import { FaArrowLeft, FaSignOutAlt, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Unauthorize() {
  const navigate = useNavigate();
  console.log("Rendering Unauthorize page");

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Top bar */}
      <div className="bg-[#cc0000] text-white px-4 pt-[env(safe-area-inset-top)] pb-4">
        <h2 className="text-2xl font-semibold text-center">Unauthorized</h2>
        <div className="flex items-center mt-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 mr-2"
            aria-label="Go back"
          >
            <FaArrowLeft className="text-2xl" />
          </button>
          <div className="flex-1"></div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-5 mt-8 rounded-2xl bg-white border border-gray-200 p-6 flex flex-col items-center text-center">
        <FaLock className="text-5xl text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          You don’t have permission to access this page
        </h3>
        <p className="text-gray-600 mb-6">
          Please go back, or log out and sign in with a different account.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate("/logout")}
            className="px-4 py-2 rounded-lg bg-[#cc0000] text-white font-semibold hover:bg-red-700 transition inline-flex items-center gap-2"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
