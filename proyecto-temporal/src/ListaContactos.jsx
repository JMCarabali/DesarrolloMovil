// src/ListaContactos.jsx

function ListaContactos({ contactos, onEliminar }) {
    return (<>
        <h3> Lista de contactos </h3>

        {
            contactos.length === 0
                ? <p> No hay contactos todavía </p>
                : (
                    <ul>
                        {
                            contactos.map((contacto, index) => {
                                return (
                                    <li key={index}>
                                        { contacto.nombre } - { contacto.telefono }

                                        <button onClick={() => onEliminar(index)}>
                                            Eliminar
                                        </button>
                                    </li>
                                );
                            })
                        }
                    </ul>
                )
        }
    </>);
}

export default ListaContactos;