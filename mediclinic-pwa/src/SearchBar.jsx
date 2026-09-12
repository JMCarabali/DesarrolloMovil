// src/SearchBar.jsx
function SearchBar({ valor, onChange }) {
  return (
    <input
      placeholder="Buscar por nombre, apellido o CC"
      value={valor}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default SearchBar;