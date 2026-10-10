import {BrowserRouter, Route, Routes} from 'react-router-dom'
import HomePage from './pages/HomePage.tsx'
import NodeDetails from './pages/NodeDetails.tsx'
import NotFound from './pages/NotFound.tsx'
import TreeLayout from './pages/TreeLayout.tsx'
import ThemeProvider from './state/ThemeProvider.tsx'
import TreeProvider from "./state/TreeProvider.tsx";

function App() {
    return (
        <ThemeProvider>
            <TreeProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/tree" element={<TreeLayout/>}>
                            <Route index element={<NodeDetails/>}/>
                            <Route path=":nodePath" element={<NodeDetails/>}/>
                            <Route path="*" element={<NodeDetails/>}/>
                        </Route>
                        <Route path="*" element={<NotFound/>}/>
                    </Routes>
                </BrowserRouter>
            </TreeProvider>
        </ThemeProvider>
    )
}

export default App
