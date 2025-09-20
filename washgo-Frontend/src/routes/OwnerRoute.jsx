import { Outlet, Route } from "react-router-dom";
import { useDevice } from "@/hooks/useDevice";
import { RequireRole } from "@/components/common/RequireRole";
// import CarwashOwnerPage from "@/pages/owner/CarwashOwnerPage";

export default function OwnerRoute() {
  const device = useDevice();

  return (
    <Route element={<RequireRole roles={["CARWASH"]} />}>
      {/* <Route path="carwashowner" element={<CarwashOwnerPage />} /> */}      
    </Route>
  );
}
