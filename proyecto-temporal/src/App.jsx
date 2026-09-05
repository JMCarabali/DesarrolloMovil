// src/App.jsx

import { useState, useEffect } from 'react';
import Loader from './Loader';
import ListaContactos from './ListaContactos';
import FormularioContacto from './FormularioContacto';
import './App.css';


function App() {

  // Estado que indica si estamos "cargando" los datos iniciales
  const [cargando, setCargando] = useState(true);

  // Estado que guarda el array de contactos
  const [contactos, setContactos] = useState([]);

  // useEffect con array vacío [] -> se ejecuta UNA sola vez,
  // cuando el componente se monta (igual que en la diapositiva 11)
  useEffect(() => {

    // Simulamos una carga de datos (como si viniera de un servidor)
    setTimeout(() => {

      // Contactos iniciales de ejemplo
      const contactosIniciales = [
        { nombre: 'Jeffrey Epstein', telefono: '3001234567' },
        { nombre: 'María Gómez', telefono: '3009876543' }
      ];

      setContactos(contactosIniciales);

      // Ya terminó de "cargar", ocultamos el Loader
      setCargando(false);

    }, 2000); // simula 2 segundos de carga

  }, []);

  // Función para agregar un contacto nuevo al array
  // Usamos el mismo patrón de la diapositiva 10:
  // setArreglo( prev => [...prev, nuevo] )
  const agregarContacto = (nuevoContacto) => {
    setContactos(prev => [...prev, nuevoContacto]);
  };

  // Función para eliminar un contacto según su posición (index) en el array
  const eliminarContacto = (indexAEliminar) => {
    setContactos(prev => prev.filter((contacto, index) => index !== indexAEliminar));
  };

  return (<>
    <h1> Mis Contactos </h1>

     <img src="/images.png" alt="Contactos" width="80" />

    {
      // Si está cargando, mostramos el Loader.
      // Si no, mostramos el formulario y la lista.
      cargando
        ? <Loader />
        : (<>
            <FormularioContacto onAgregar={agregarContacto} />
            <ListaContactos
              contactos={contactos}
              onEliminar={eliminarContacto}
            />
          </>)
    }
  </>);
}

export default App;