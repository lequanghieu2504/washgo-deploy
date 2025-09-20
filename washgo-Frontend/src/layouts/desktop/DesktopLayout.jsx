import UserHeader from "@/layouts/components/UserHeader";
import { Outlet } from "react-router-dom";

const DesktopLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <UserHeader isDesktop={true} />
      <div className="flex-1">{<Outlet />}</div>
    </div>
  );
};

export default DesktopLayout;
