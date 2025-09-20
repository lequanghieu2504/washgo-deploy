import "./App.css";
// import { Routes } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import DebugMediaTester from "@/components/debugging/DebugMediaTester";
import UserRoute from "@/routes/UserRoute";
import ClientRoute from "@/routes/ClientRoute";
import OwnerRoute from "@/routes/OwnerRoute";
import ManagerRoute from "@/routes/ManagerRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        {UserRoute()}
        {ClientRoute()}
        {ManagerRoute()}
        {OwnerRoute()}
        <Route path="/debug-media" element={<DebugMediaTester />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
