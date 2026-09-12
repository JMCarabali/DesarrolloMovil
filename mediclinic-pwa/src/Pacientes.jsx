// src/Pacientes.jsx
import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import PatientForm from './PatientForm';
import PatientList from './PatientList';

function Pacientes({ usuario, onLogout }) {
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const guardados = JSON.parse(localStorage.getItem('pacientes')) || [];
    setPacientes(guardados);
  }, []);

  const addPaciente = (nuevo) => {
    const actualizados = [...pacientes, nuevo];
    setPacientes(actualizados);
    localStorage.setItem('pacientes', JSON.stringify(actualizados));
  };

  const pacientesFiltrados = pacientes.filter((p) => {
    const texto = busqueda.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(texto) ||
      p.apellido.toLowerCase().includes(texto) ||
      p.cc.includes(texto)
    );
  });

  return (
    <>
      <p>Bienvenido, {usuario}</p>
      <button onClick={onLogout}>Cerrar sesión</button>

      <SearchBar valor={busqueda} onChange={setBusqueda} />
      <PatientForm onAdd={addPaciente} />
      <PatientList pacientes={pacientesFiltrados} />
    </>
  );
}

export default Pacientes;