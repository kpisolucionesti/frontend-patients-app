import './App.css';
import { Route, Routes } from 'react-router-dom';
import RoomTable from './Components/Table/RoomTable';
import TablePatients from './Components/Table/TablePatients';

function App() {
  return (
    <Routes >
      <Route path="/" element={<TablePatients />} exact />
      <Route path="/adulto" element={<RoomTable />} exact />
    </Routes >
  );
}

export default App;
