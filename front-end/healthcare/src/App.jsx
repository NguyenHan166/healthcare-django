import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import Home from './components/Home';
import Appointments from './components/Appointments';
import PatientRecords from './components/PatientRecords';
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <div className="pt-16"> {/* Adjust based on navbar height */}
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/patient-records" element={<PatientRecords />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;