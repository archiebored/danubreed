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
import DanielsCamp from './pages/DanielsCamp';
import Gallery from './pages/Gallery';
import VisitUs from './pages/VisitUs';
import StaffLogin from './pages/StaffLogin';
import Dashboard from './pages/Dashboard';
import StaffMembers from './pages/StaffMembers';
import StaffEvents from './pages/StaffEvents';
import StaffConfessions from './pages/StaffConfessions';
import StaffRoles from './pages/StaffRoles';
import StaffServiceTimes from './pages/StaffServiceTimes';
import StaffCoordinators from './pages/StaffCoordinators';
import StaffCamp from './pages/StaffCamp';
import StaffCampCheckIn from './pages/StaffCampCheckIn';
import StaffGallery from './pages/StaffGallery';
import StaffVisitInfo from './pages/StaffVisitInfo';

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
        <Route path="/camp" element={<DanielsCamp />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/visit" element={<VisitUs />} />
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
        <Route path="/staff/camp" element={<StaffCamp />} />
        <Route path="/staff/camp/check-in" element={<StaffCampCheckIn />} />
        <Route path="/staff/gallery" element={<StaffGallery />} />
        <Route path="/staff/visit-info" element={<StaffVisitInfo />} />
      </Route>
    </Routes>
  );
}