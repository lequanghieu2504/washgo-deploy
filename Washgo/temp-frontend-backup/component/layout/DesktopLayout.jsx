import UserHeader from "../common/UserHeader";

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <UserHeader isDesktop={true} />
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default MainLayout;
