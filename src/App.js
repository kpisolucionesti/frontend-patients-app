import './App.css';
import RoomTable from './Components/Table/RoomTable';
import TablePatients from './Components/Table/TablePatients';
import { Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Routes >
      <Route path="/" element={<TablePatients />} exact />
      <Route path="/rooms" element={<RoomTable />} exact />
    </Routes >
  );
}

export default App;
