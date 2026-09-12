// src/PatientList.jsx
function PatientList({ pacientes }) {
  if (pacientes.length === 0) {
    return <p className="empty-text">No hay pacientes para mostrar.</p>;
  }

  return (
    <div>
      {pacientes.map((p) => (
        <div key={p.id} className="patient-row">
          <div className="name">
            {p.nombre} {p.apellido}
          </div>
          <div className="meta">
            CC: {p.cc} · Tel: {p.telefono || '-'}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PatientList;