import './App.css';
import PatientsView from './Components/Table/PatientsView';
import RoomTable from './Components/Table/RoomTable';
import { Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Routes >
      <Route path="/" element={<PatientsView />} exact />
      <Route path="/adulto" element={<RoomTable />} exact />
    </Routes >
  );
}

export default App;
