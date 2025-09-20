import { Route } from "react-router-dom";
import { RequireRole } from "@/components/common/RequireRole";
import Personal from "@/pages/client/Personal";
import { useDevice } from "@/hooks/useDevice";
import UserProfile from "@/pages/client/UserProfile";
import ChangePassword from "@/pages/auth/ChangePassword";
import History from "@/pages/client/History";
import Payment from "@/pages/client/Payment";
import BookedDetail from "@/pages/client/BookedDetail";
import Feedback from "@/components/common/Feedback";

export default function ClientRoute() {
  return (
    <Route element={<RequireRole roles={["CLIENT"]} />}>
      <Route path="personal" element={<Personal />} />
      <Route path="userProfile" element={<UserProfile />} />
      <Route path="change-password" element={<ChangePassword />} />
      <Route path="payment" element={<Payment />} />
      <Route path="personal/history" element={<History />} />
      <Route path="personal/history/:id" element={<BookedDetail />} />
      <Route
        path="feedback/carwash/:carwashId/booking/:bookingId"
        element={<Feedback />}
      />
      {/* <Route
        element={device === "mobile" ? <MobileLayout /> : <DesktopLayout />}
      >
      </Route> */}
    </Route>
  );
}
