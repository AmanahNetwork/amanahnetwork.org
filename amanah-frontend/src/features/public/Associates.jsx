export default function Associates() {
  const members = [{ name: "John Doe", role: "Chairperson" }, { name: "Jane Smith", role: "Treasurer" }];
  return (
    <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-4">
      {members.map(m => (
        <div className="border p-4 rounded shadow text-center">
          <h3>{m.name}</h3>
          <p className="text-gray-600">{m.role}</p>
        </div>
      ))}
    </div>
  );
}