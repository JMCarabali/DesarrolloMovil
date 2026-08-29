// src/FormularioContacto.jsx

import { useState } from 'react';

function FormularioContacto({ onAgregar }) {

    // Estado para el nombre que se está escribiendo
    const [nombre, setNombre] = useState('');

    // Estado para el teléfono que se está escribiendo
    const [telefono, setTelefono] = useState('');

    // Se ejecuta cuando el usuario le da clic al botón "Agregar"
    const manejarAgregar = () => {

        // Validación simple: que no estén vacíos los campos
        if (nombre === '' || telefono === '') {
            console.log('Debes escribir nombre y teléfono');
            return;
        }

        // Le avisamos al padre (App.jsx) que se debe agregar este contacto
        onAgregar({ nombre: nombre, telefono: telefono });

        // Limpiamos los campos del formulario
        setNombre('');
        setTelefono('');
    };

    return (<>
        <h3> Agregar nuevo contacto </h3>

        <input
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
        />

        <input
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
        />

        <button onClick={manejarAgregar}>
            Agregar
        </button>
    </>);
}

export default FormularioContacto;