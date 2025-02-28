import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import  Contact  from './pages/Contact';
import Home from './Home';
import About from './pages/About';
import LoggedinHome from './pages/LoggedinHome';
import Login from "./pages/Login"
// import Teams from './pages/Teams';
// import Team from './pages/Team';
// import TeamEdit from './pages/TeamEdit';
// import Chat from './pages/Chat';
import Signin from './pages/Signin';
import CreateProfile from './pages/CreateProfile';
// import EditProfile from './pages/EditProfile';
// import UsersList from './pages/UsersList';
import UserProfile from './pages/userProfile';

import { AuthProvider } from './AuthContext';
import Activities from './components/Activities';
// import ActivitiesPage from './pages/ActivitiesPage';
// import MyTeams from './pages/MyTeams';
// import Invitations from './pages/Invitations';

// import RecommendedContent from './pages/RecommendedContent';
// import SkillAssessmentPage from './components/SkillAssessmentPage';

const App = () => {
  return (

    <AuthProvider>

      <Router>
        <div className='w-full overflow-hidden'>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/loggedinhome" element={

              <LoggedinHome />

            } />
            <Route path="/contact" element={<Contact />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/login" element={<Login />} />
            {/* <Route path="/userslist" element={<UsersList />} /> */}
            {/* <Route path="/activities" element={<ActivitiesPage />} /> */}
            <Route path="/create-profile" element={<CreateProfile />} />
            {/* <Route path="/editprofile" element={<EditProfile />} /> */}
            <Route path="/user/:id" element={<UserProfile />} />
            <Route path="/about" element={<About />} />
            {/* <Route path='/teams' element={<Teams />} /> */}
            {/* <Route path='/team/:id' element={<Team />} />
            <Route path="/team/new" element={<TeamEdit />} /> 
            <Route path="/team/edit/:id" element={<TeamEdit />} />  
            <Route path='/myteams' element={<MyTeams />} />
            <Route path="/chat/:chatroomId" element={<Chat />} />
            <Route path='/invitations' element={<Invitations />} /> */}
            {/* <Route path="/recommended-content" element={<RecommendedContent />} />
            <Route path="/assessment/:skill" element={<SkillAssessmentPage />} /> */}


          </Routes>
        </div>
      </Router>

    </AuthProvider>
  )
}

export default App