import { useNavigate } from "react-router-dom";

export default function Sidebar({ role }) {
  const navigate = useNavigate();

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-blue-600 to-purple-600 text-white p-5 fixed">

      <h1 className="text-2xl font-bold mb-8">
        Campus2Career
      </h1>

      <div className="flex flex-col gap-4">

        {role === "student" && (
          <>
            <button onClick={() => navigate("/student")}>Dashboard</button>
            <button>Jobs</button>
            <button>Courses</button>
          </>
        )}

        {role === "industry" && (
          <>
            <button onClick={() => navigate("/industry")}>Dashboard</button>
            <button>Post Jobs</button>
            <button>Candidates</button>
          </>
        )}

        <button
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          className="mt-10 text-red-300"
        >
          Logout
        </button>

      </div>
    </div>
  );
}