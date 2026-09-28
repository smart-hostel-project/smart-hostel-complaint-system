import { useState } from "react";
import Login from "./Login";
import { supabase } from "./supabaseClient";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [adminMode, setAdminMode] = useState(false);

  const addComplaint = async (e) => {
    e.preventDefault();

    if (!title || !description) {
      alert("Please fill all fields");
      return;
    }

    const { data, error } = await supabase
      .from("complaints")
      .insert([
        {
          title: title,
          description: description,
          status: "Pending",
        },
      ])
      .select();

    if (error) {
      console.error("Supabase Error:", error);
      alert("Complaint save failed");
      return;
    }

    setComplaints([...complaints, data[0]]);
    setTitle("");
    setDescription("");

    alert("Complaint submitted successfully!");
  };

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from("complaints")
      .update({ status: status })
      .eq("id", id);

    if (error) {
      console.error("Update Error:", error);
      alert("Status update failed");
      return;
    }

    setComplaints(
      complaints.map((complaint) =>
        complaint.id === id
          ? { ...complaint, status: status }
          : complaint
      )
    );
  };

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <div className="app">
      <header>
        <h1>🏠 Smart Hostel Complaint System</h1>
        <p>Manage Hostel Complaints Easily</p>

        <button onClick={() => setAdminMode(!adminMode)}>
          {adminMode ? "Student View" : "Admin Dashboard"}
        </button>
      </header>

      <main>
        {!adminMode ? (
          <>
            <section className="card">
              <h2>Submit Complaint</h2>

              <form onSubmit={addComplaint}>
                <input
                  type="text"
                  placeholder="Complaint Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <textarea
                  placeholder="Describe your complaint"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <button type="submit">
                  Submit Complaint
                </button>
              </form>
            </section>

            <section className="card">
              <h2>My Complaints</h2>

              {complaints.length === 0 ? (
                <p>No complaints yet.</p>
              ) : (
                complaints.map((complaint) => (
                  <div className="complaint" key={complaint.id}>
                    <h3>{complaint.title}</h3>
                    <p>{complaint.description}</p>

                    <strong>
                      Status: {complaint.status}
                    </strong>
                  </div>
                ))
              )}
            </section>
          </>
        ) : (
          <section className="card">
            <h2>👨‍💼 Admin Dashboard</h2>

            <div className="stats">
              <div>
                <h3>{complaints.length}</h3>
                <p>Total Complaints</p>
              </div>

              <div>
                <h3>
                  {complaints.filter(
                    (c) => c.status === "Pending"
                  ).length}
                </h3>
                <p>Pending</p>
              </div>

              <div>
                <h3>
                  {complaints.filter(
                    (c) => c.status === "Resolved"
                  ).length}
                </h3>
                <p>Resolved</p>
              </div>
            </div>

            <h3>All Complaints</h3>

            {complaints.length === 0 ? (
              <p>No complaints available.</p>
            ) : (
              complaints.map((complaint) => (
                <div className="complaint" key={complaint.id}>
                  <h3>{complaint.title}</h3>
                  <p>{complaint.description}</p>

                  <select
                    value={complaint.status}
                    onChange={(e) =>
                      updateStatus(
                        complaint.id,
                        e.target.value
                      )
                    }
                  >
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                  </select>
                </div>
              ))
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;