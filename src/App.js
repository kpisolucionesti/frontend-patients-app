import './App.css';
import { RoomTable } from './Components/Table/RoomTable';
import TablePatients from './Components/Table/TablePatients';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<TablePatients />} />
      <Route path="/rooms" element={ <RoomTable /> } />
    </Routes>
  );
}

export default App;
