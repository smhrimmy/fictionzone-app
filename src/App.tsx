import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Home from './pages/Home';
import MangaHome from './pages/MangaHome';
import Discovery from './pages/Discovery';
import Library from './pages/Library';
import Collections from './pages/Collections';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import Reader from './pages/Reader';
import MangaReader from './pages/MangaReader';
import StoryDetails from './pages/StoryDetails';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Novel Mode Routes */}
          <Route path="/" element={<Home />} />
          
          {/* Manga Mode Routes */}
          <Route path="/manga" element={<MangaHome />} />
          
          {/* Shared/Mixed Routes */}
          <Route path="/story/:storyId" element={<StoryDetails />} />
          <Route path="/discovery" element={<Discovery />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/library" element={<Library />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Manga Specific Sub-routes */}
          <Route path="/manga/discovery" element={<Discovery />} /> {/* Reusing Discovery for now */}
          <Route path="/manga/latest" element={<Discovery />} /> {/* Reusing Discovery for now */}
        </Route>
        
        {/* Readers (No Layout) */}
        <Route path="/read/:storyId/:chapterId" element={<Reader />} />
        <Route path="/manga/read/:storyId/:chapterId" element={<MangaReader />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
