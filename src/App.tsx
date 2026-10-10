import {BrowserRouter, Route, Routes} from 'react-router-dom'
import HomePage from './pages/HomePage.tsx'
import NotFound from './pages/NotFound.tsx'
import TreeLayout from './pages/TreeLayout.tsx'
import TreeProvider from "./state/TreeProvider.tsx";

function App() {
    return (
        <TreeProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route path="/tree" element={<TreeLayout/>}>
                        <Route index element={<p>Node details go here.</p>}/>
                        <Route path="*" element={<p>Node details go here.</p>}/>
                    </Route>
                    <Route path="*" element={<NotFound/>}/>
                </Routes>
            </BrowserRouter>
        </TreeProvider>
    )
}

export default App
