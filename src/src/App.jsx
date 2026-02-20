import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./components/Auth/Login/Login";
import UserDashboard from "./components/User/UserDashboard/UserDashboard";
import AdminDashboard from "./components/Admin/AdminDashboard/AdminDashboard.jsx";
import { ToastContainer } from "react-toastify";
import SuperAdminDashboard from "./components/SuperAdmin/SuperAdminDashboard/SuperAdminDashboard.jsx";
import WelcomePage from "./components/Auth/WelcomePage/WelcomePage.jsx";
import SuperAdminLogin from "./components/Auth/Login/SuperAdminLogin.jsx";
import OrganizationLogin from "./components/Auth/Login/OrganizationLogin.jsx";
import AdminLogin from "./components/Auth/Login/AdminLogin.jsx";
import Customers from "./components/User/Customer/Customers.jsx";
import Logout from "./components/CommonComponent/Logout/Logout.jsx";
import ProtectedRouteUser from "./components/ProtectedRoute/ProtectedRouteUser.jsx";
import ProtectedRouteSuper from "./components/ProtectedRoute/ProtectedRouteSuper.jsx";
import ProtectedRouteAdmin from "./components/ProtectedRoute/ProtectedRouteAdmin.jsx";
import { ChatScreen } from "./components/User/ChatScreen/chatScreen.jsx";
import Resolutions from "./components/User/Resolutions/Resolutions.jsx";

import Leads from "./components/Admin/Leads/Leads.jsx";
import Services from "./components/Admin/Services/Services.jsx";
import AdminCustomer from "./components/Admin/AdminCustomer/AdminCustomer.jsx";
import NonCustomerFacingData from "./components/Admin/NonCustomerFacingData/NonCustomerFacingData.jsx";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />

      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/super-admin-login" element={<SuperAdminLogin />} />
        <Route path="/organization-login" element={<OrganizationLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/user1234" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        {/* SuperAdmin */}
        <Route
          path="/super-admin-dashboard"
          element={
            <ProtectedRouteSuper
              element={SuperAdminDashboard}
              allowedRoles={["SuperAdmin"]}
            />
          }
        />

        {/* Admin */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRouteAdmin
              element={AdminDashboard}
              allowedRoles={["admin"]}
            />
          }
        />

        <Route
          path="/leads"
          element={
            <ProtectedRouteAdmin element={Leads} allowedRoles={["admin"]} />
          }
        />

        <Route
          path="/customer-services"
          element={
            <ProtectedRouteAdmin element={Services} allowedRoles={["admin"]} />
          }
        />
        <Route
          path="/admin-customer"
          element={
            <ProtectedRouteAdmin
              element={AdminCustomer}
              allowedRoles={["admin"]}
            />
          }
        />

        <Route
          path="/non-customer-facing-data"
          element={
            <ProtectedRouteAdmin
              element={NonCustomerFacingData}
              allowedRoles={["admin"]}
            />
          }
        />
        {/* User */}
        <Route
          path="/organization-dashboard"
          element={
            <ProtectedRouteUser
              element={UserDashboard}
              allowedRoles={["user"]}
            />
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRouteUser element={Customers} allowedRoles={["user"]} />
          }
        />
        <Route
          path="customer-client-general-data"
          element={
            <ProtectedRouteUser element={Resolutions} allowedRoles={["user"]} />
          }
        />
        <Route
          path="/chat/:orgId/:org_name/customer-ai-chatbot"
          element={<ChatScreen />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
