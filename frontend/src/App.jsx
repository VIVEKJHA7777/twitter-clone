import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/login/LoginPage';
import SignUpPage from './pages/auth/signup/SignUpPage';
import Sidebar from './components/common/Sidebar';
import RightPanel from './components/common/RightPanel';
import NotificationPage from './pages/notification/NotificationPage';
import ProfilePage from './pages/profile/ProfilePage';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from './components/common/LoadingSpinner';
import { Toaster } from 'react-hot-toast';

function App() {
    const { data: authUser, isLoading } = useQuery({
		//query key to give a unique name to our query.......
        queryKey: ['authUser'],
        queryFn: async () => {
            try {
                const res = await fetch("/api/auth/me");
                const data = await res.json();
               
				//because when user is logout then authUser is undefined so thai i set it to null........
				if(data.error){
					return null;
				}

                if (!res.ok) {
                    throw new Error(data.error || "Something went wrong");
                }
                return data;
            } catch (error) {
                throw new Error(error.message);
            }
        },
		retry:false,
    });

    if (isLoading) {
        return (
            <div className='h-screen flex justify-center items-center'>
                <LoadingSpinner size='lg' />
            </div>
        );
    }

    return (
        <div className='flex max-w-6xl mx-auto'>
            {authUser && <Sidebar />}
            <Routes>
                <Route path='/' element={authUser ? <HomePage /> : <Navigate to="/login" />} />
                <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
                <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
                <Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to="/login" />} />
                <Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
            </Routes>
            {authUser && <RightPanel /> }
            <Toaster />
        </div>
    );
}

export default App;
