import React from "react";
import { useTranslation } from "react-i18next";

export default function LoadingSpinner() {
  const { t } = useTranslation(); // Initialize translation hook

  return (
    <div className="flex items-center justify-center p-10 text-gray-500">
      <i className="fas fa-spinner fa-spin mr-3 text-2xl text-[#cc0000]"></i>
      {t("carwash_profile.loading")}
    </div>
  );
}
