import { Routes, Route } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import AdminLayout from './components/AdminLayout';
import RequireStaff from './components/RequireStaff';
import Home from './pages/Home';
import Give from './pages/Give';
import Events from './pages/Events';
import Confess from './pages/Confess';
import More from './pages/More';
import Contact from './pages/Contact';
import Signup from './pages/Signup';
import Login from './pages/Login';
import StaffLogin from './pages/StaffLogin';
import Dashboard from './pages/Dashboard';
import StaffMembers from './pages/StaffMembers';
import StaffEvents from './pages/StaffEvents';
import StaffConfessions from './pages/StaffConfessions';
import StaffRoles from './pages/StaffRoles';
import StaffServiceTimes from './pages/StaffServiceTimes';
import StaffCoordinators from './pages/StaffCoordinators';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/give" element={<Give />} />
        <Route path="/events" element={<Events />} />
        <Route path="/confess" element={<Confess />} />
        <Route path="/more" element={<More />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Route>

      <Route path="/staff/login" element={<StaffLogin />} />

      <Route
        element={
          <RequireStaff>
            <AdminLayout />
          </RequireStaff>
        }
      >
        <Route path="/staff/dashboard" element={<Dashboard />} />
        <Route path="/staff/members" element={<StaffMembers />} />
        <Route path="/staff/events" element={<StaffEvents />} />
        <Route path="/staff/confessions" element={<StaffConfessions />} />
        <Route path="/staff/roles" element={<StaffRoles />} />
        <Route path="/staff/service-times" element={<StaffServiceTimes />} />
        <Route path="/staff/coordinators" element={<StaffCoordinators />} />
      </Route>
    </Routes>
  );
}