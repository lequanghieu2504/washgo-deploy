import React from "react";
import { Route } from "react-router-dom";
import Manager from "@/pages/admin/Manager";
import { RequireRole } from "@/components/common/RequireRole";

const ManagerRoute = () => {
  return (
    <Route element={<RequireRole roles={["CARWASH"]} />}>
      <Route path="/manager/*" element={<Manager />} />;
    </Route>
  );
};

export default ManagerRoute;
