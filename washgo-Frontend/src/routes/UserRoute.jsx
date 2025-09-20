import { Outlet, Route } from "react-router-dom";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Logout from "@/pages/auth/Logout";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import OtpVerification from "@/components/common/OtpVerification";
import Home from "@/pages/visitor/Home";
import { useDevice } from "@/hooks/useDevice";
import MobileLayout from "@/layouts/mobile/MobileLayout";
import DesktopLayout from "@/layouts/desktop/DesktopLayout";
import CarwashMap from "@/pages/visitor/CarwashMap";
import GuestProfile from "@/pages/client/GuestProfile";
import BookingDetailReview from "@/pages/visitor/BookingDetailReview";
import BookingConfirmation from "@/pages/visitor/BookingConfirmation";
import { Test } from "@/components/debugging";
import SpecialOffer from "@/pages/visitor/SpecialOffer";
import CarwashDiscoverPage from "@/pages/visitor/CarwashDiscoverPage";
import Unauthorize from "@/pages/auth/Unauthorize";
import BackHeaderAndNavFooter from "@/layouts/mobile/BackHeaderAndNavFooter";

export default function UserRoute() {
  const device = useDevice();

  return (
    <Route path="/" element={<Outlet />}>
      {/* Public Routes */}
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="logout" element={<Logout />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="otp-verification" element={<OtpVerification />} />

      <Route path="guest-profile" element={<GuestProfile />} />
      <Route path="unauthorize" element={<Unauthorize />} />
      <Route path="test" element={<Test />} />
      <Route path="confirm-booking" element={<BookingConfirmation />} />
      <Route
        element={device === "mobile" ? <MobileLayout /> : <DesktopLayout />}
      >
        <Route index element={<Home />} />
        <Route path="map" element={<CarwashMap />} />
        <Route path="booking-details" element={<BookingDetailReview />} />
        <Route
          path="/discover/:discoverType"
          element={<CarwashDiscoverPage />}
        />
      </Route>
      <Route
        element={device === "mobile" ? <BackHeaderAndNavFooter /> : <Outlet />}
      >
        <Route path="special-offers" element={<SpecialOffer />} />
      </Route>
    </Route>
  );
}
