import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Teams from "./pages/Teams";
import Invitations from "./pages/Invitations";
import { TeamProvider } from "./context/TeamContext";
import Logs from "./pages/Logs";
import PublicStatus from "./pages/PublicStatus";

import SyntheticTransactions from "./pages/SyntheticTransactions";
import SyntheticTransactionDetails from "./pages/SyntheticTransactionDetails";
import CreateSyntheticTransaction from "./pages/CreateSyntheticTransaction";

import Monitors from "./pages/Monitors";
import Servers from "./pages/Servers";
import Incidents from "./pages/Incidents";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import MonitorDetail from "./pages/MonitorDetail";



function App() {
  return (
    <BrowserRouter>
      <TeamProvider>
        <Routes>

          {/* DEFAULT */}
          <Route
            path="/"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

          {/* AUTH */}
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* DASHBOARD */}
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* MONITORS */}
          <Route
            path="/monitors"
            element={<Monitors />}
          />
          <Route
            path="/monitors/:id"
            element={<MonitorDetail />}
          />

          {/* SYNTHETIC TRANSACTIONS */}
          {/* SYNTHETIC TRANSACTIONS */}
          <Route
            path="/synthetic-transactions"
            element={
              <SyntheticTransactions />
            }
          />

          <Route
            path="/synthetic-transactions/create"
            element={
              <CreateSyntheticTransaction />
            }
          />

          <Route
            path="/synthetic-transactions/:id"
            element={
              <SyntheticTransactionDetails />
            }
          />

          {/* SERVERS */}
          <Route
            path="/servers"
            element={<Servers />}
          />

          {/* INCIDENTS */}
          <Route
            path="/incidents"
            element={<Incidents />}
          />

          {/* REPORTS */}
          <Route
            path="/reports"
            element={<Reports />}
          />

          {/* SETTINGS */}
          <Route
            path="/settings"
            element={<Settings />}
          />
          <Route path="/status/:userId" element={<PublicStatus />} />
          <Route
            path="/teams"
            element={<Teams />}
          />
          <Route
            path="/invitations"
            element={<Invitations />}
          />

          {/* UNKNOWN URL */}
          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />
          <Route path="/logs" element={<Logs />} />

        </Routes>
      </TeamProvider>
    </BrowserRouter>
  );
}

export default App;