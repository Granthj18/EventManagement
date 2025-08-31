import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Register from './pages/register';
import Home from './pages/home';
import CreateEvent from './Events/CreateEvent';
import { UserProvider } from './UserContext';
import EventDetail from './pages/EventDetail';
import RegisterEvent from './pages/RegisterEvent';
import MyEvents from './pages/MyEvents';
import EditEvent from './pages/EditEvents';
import SearchResults from './pages/SearchResult';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register/:id" element={<RegisterEvent />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create" element={<CreateEvent />} />
          <Route path="/myevents" element={<MyEvents />} />  
          <Route path="/events/edit/:id" element={<EditEvent />} />
          <Route path="/search" element={<SearchResults />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
