import { Routes, Route } from 'react-router-dom';
import { NotificationProvider } from '@/components/ui/notification';

// Import pages
import Home from '@/app/page';
import Dashboard from '@/app/dashboard/page';
import Profile from '@/app/profile/page';
import Settings from '@/app/settings/page';
import Teams from '@/app/teams/page';
import TeamDetail from '@/app/teams/[id]/page';
import Events from '@/app/events/page';
import EventDetail from '@/app/events/[id]/page';
import EventRegister from '@/app/events/[id]/register/page';
import Network from '@/app/network/page';
import Connections from '@/app/connections/page';
import Messages from '@/app/messages/page';
import Performance from '@/app/performance/page';
import Achievements from '@/app/achievements/page';
import UserProfile from '@/app/users/[id]/page';
import SignIn from '@/app/sign-in/[[...sign-in]]/page';
import SignUp from '@/app/sign-up/[[...sign-up]]/page';
import NotFound from '@/app/not-found';

function App() {
  return (
    <NotificationProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/teams/:id" element={<TeamDetail />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/events/:id/register" element={<EventRegister />} />
        <Route path="/network" element={<Network />} />
        <Route path="/connections" element={<Connections />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/users/:id" element={<UserProfile />} />
        <Route path="/sign-in/*" element={<SignIn />} />
        <Route path="/sign-up/*" element={<SignUp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </NotificationProvider>
  );
}

export default App;
