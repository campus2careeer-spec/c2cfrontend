import Card from "../components/Card";

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <Card>
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <p>Manage Users & Companies</p>
      </Card>
    </div>
  );
}