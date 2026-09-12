// src/PatientForm.jsx
import { useState } from 'react';

function PatientForm({ onAdd }) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [cc, setCc] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!nombre.trim() || !apellido.trim() || !cc.trim()) {
      setError('Nombre, apellido y CC son obligatorios');
      return;
    }
    if (!/^\d+$/.test(cc)) {
      setError('La CC solo debe contener números');
      return;
    }

    onAdd({ id: Date.now(), nombre, apellido, cc, telefono });
    setNombre('');
    setApellido('');
    setCc('');
    setTelefono('');
    setError('');
  };

  return (
    <div className="card">
      <h3>Agregar paciente</h3>
      <input
        className="form-input"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <input
        className="form-input"
        placeholder="Apellido"
        value={apellido}
        onChange={(e) => setApellido(e.target.value)}
      />
      <input
        className="form-input"
        placeholder="CC"
        value={cc}
        onChange={(e) => setCc(e.target.value)}
      />
      <input
        className="form-input"
        placeholder="Teléfono"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
      />
      <button className="btn" onClick={handleSubmit}>
        Agregar
      </button>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export default PatientForm;