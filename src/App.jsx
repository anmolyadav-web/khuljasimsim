import React, { useEffect, useState } from "react";
import { ref, set, onValue } from "firebase/database";
import { db, auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import "../App.css";

function App() {
  const defaultStudent = {
    name: "",
    rollNo: "",
    branch: "Computer Science",
    year: "4",
    email: "",
    phone: "",
    researchTopic: "",
    publications: [""],
  };

  const [student, setStudent] = useState(defaultStudent);
  const [students, setStudents] = useState({});
  const [status, setStatus] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      setStatus("Signing in...");
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setStatus("Signed in successfully.");
    } catch (error) {
      console.error("Google sign-in error", error);
      setStatus(`Sign-in error: ${error.message}`);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setStatus("Signed out.");
    } catch (error) {
      console.error("Sign-out error", error);
      setStatus(`Sign-out error: ${error.message}`);
    }
  };

  useEffect(() => {
    const studentsRef = ref(db, "students");
    return onValue(studentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setStudents(data);
    });
  }, []);

  const handleChange = (field) => (event) => {
    setStudent((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handlePublicationChange = (index, value) => {
    setStudent((prev) => {
      const publications = [...prev.publications];
      publications[index] = value;
      return { ...prev, publications };
    });
  };

  const addPublication = () => {
    setStudent((prev) => ({ ...prev, publications: [...prev.publications, ""] }));
  };

  const removePublication = (index) => {
    setStudent((prev) => {
      const publications = prev.publications.filter((_, i) => i !== index);
      return { ...prev, publications: publications.length ? publications : [""] };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!student.name || !student.rollNo) {
      setStatus("Name and roll number are required.");
      return;
    }

    const studentId = student.rollNo.trim();
    const studentRef = ref(db, `students/${studentId}`);

    try {
      await set(studentRef, {
        name: student.name,
        rollNo: student.rollNo,
        branch: student.branch,
        year: student.year,
        email: student.email,
        phone: student.phone,
        researchTopic: student.researchTopic,
        publications: student.publications.filter((p) => p.trim() !== ""),
        updatedAt: new Date().toISOString(),
      });
      setStatus("Data saved successfully.");
      setStudent(defaultStudent);
    } catch (error) {
      console.error("Firebase write failed", error);
      setStatus(`Write error: ${error.message}`);
    }
  };

  const clearAll = async () => {
    try {
      await set(ref(db, "students"), null);
      setStatus("All student records deleted.");
    } catch (error) {
      console.error("Delete failed", error);
      setStatus(`Delete error: ${error.message}`);
    }
  };

  return (
    <div className="App" style={{ padding: 20, maxWidth: 900, margin: "auto" }}>
      <h1>Researcher BTech Student Entry</h1>

      <div style={{ marginBottom: 24 }}>
        {user ? (
          <div>
            <p>
              Signed in as <strong>{user.email}</strong>
            </p>
            <button type="button" onClick={signOutUser} style={{ marginBottom: 12 }}>
              Sign out
            </button>
          </div>
        ) : (
          <button type="button" onClick={signInWithGoogle} style={{ marginBottom: 12 }}>
            Sign in with Google
          </button>
        )}
      </div>

      {!user ? (
        <p>Please sign in with your researcher Google account to manage student records.</p>
      ) : (
        <>
          <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
            <label>
              Name:
              <input value={student.name} onChange={handleChange("name")} required />
            </label>

            <label>
              Roll Number:
              <input value={student.rollNo} onChange={handleChange("rollNo")} required />
            </label>

            <label>
              Branch:
              <select value={student.branch} onChange={handleChange("branch")}>{
                ["Computer Science", "Electronics", "Mechanical", "Civil", "Biotech"].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))
              }</select>
            </label>

            <label>
              Year:
              <select value={student.year} onChange={handleChange("year")}>{
                ["1", "2", "3", "4"].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))
              }</select>
            </label>

            <label>
              Email:
              <input type="email" value={student.email} onChange={handleChange("email")} />
            </label>

            <label>
              Phone:
              <input value={student.phone} onChange={handleChange("phone")} />
            </label>

            <label>
              Research Topic:
              <input value={student.researchTopic} onChange={handleChange("researchTopic")} />
            </label>

            <div style={{ marginTop: 16 }}>
              <strong>Publications (dynamic)</strong>
              {student.publications.map((publication, index) => (
                <div key={index} style={{ display: "flex", gap: 8, margin: "8px 0" }}>
                  <input
                    value={publication}
                    onChange={(e) => handlePublicationChange(index, e.target.value)}
                    placeholder={`Publication #${index + 1}`}
                    style={{ flex: 1 }}
                  />
                  <button type="button" onClick={() => removePublication(index)}>
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" onClick={addPublication}>Add Publication</button>
            </div>

            <div style={{ marginTop: 16 }}>
              <button type="submit">Save Student</button>
              <button type="button" onClick={() => setStudent(defaultStudent)} style={{ marginLeft: 8 }}>
                Reset Form
              </button>
            </div>

            <p style={{ color: "green" }}>{status}</p>
          </form>

          <h2>Saved Students (Read from Firebase)</h2>
          <button type="button" onClick={clearAll} style={{ marginBottom: 12 }}>
            Clear All Students
          </button>
          <div>
            {Object.keys(students).length === 0 ? (
              <p>No student entries yet.</p>
            ) : (
              <ul>
                {Object.entries(students).map(([id, data]) => (
                  <li key={id} style={{ marginBottom: 12 }}>
                    <strong>{data.name || id}</strong> ({data.rollNo}) - {data.branch}, Year {data.year}
                    <br />
                    Research: {data.researchTopic || "N/A"}
                    <br />
                    Publications: {data.publications && data.publications.length > 0 ? data.publications.join("; ") : "None"}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
