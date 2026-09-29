import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CalendarView from "./pages/CalendarView.jsx";
import Upcoming from "./pages/Upcoming.jsx";
import History from "./pages/History.jsx";
import MeetingDetails from "./pages/MeetingDetails.jsx";
import MeetingForm from "./pages/MeetingForm.jsx";
import Tasks from "./pages/Tasks.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-400">
        Loading…
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/calendar" element={<CalendarView />} />
        <Route path="/upcoming" element={<Upcoming />} />
        <Route path="/history" element={<History />} />
        <Route path="/meetings/new" element={<MeetingForm />} />
        <Route path="/meetings/:id" element={<MeetingDetails />} />
        <Route path="/meetings/:id/edit" element={<MeetingForm />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
