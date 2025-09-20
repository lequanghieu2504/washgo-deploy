import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLogout } from "@/hooks/useLogout";

function Logout() {
  const { t } = useTranslation();
  const { logout } = useLogout();

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center -mt-7">
      <div className="w-full max-w-md bg-white p-8">
        <div className="flex flex-col items-center text-center">
          <svg
            className="w-16 h-16 text-green-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {t("logout.success_heading")}
          </h1>
          <p className="text-gray-600 mb-6">{t("logout.success_message")}</p>

          <Link
            to="/login"
            className="w-full bg-[#cc0000] hover:bg-[#a30000] text-white font-semibold py-3 rounded-xl text-[19px] text-center transition duration-300"
          >
            {t("logout.go_to_login")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Logout;
