import { useEffect, useState } from "react";


const StaffDepartment = () => {
  const [deptId, setDeptId] = useState("");
  const [staffId, setstaffId] = useState("");
  const [deptData, setDeptData] = useState([]);
  const [loading, setLoading] = useState(true);

  async function getDeptData(deptIde) {
    setLoading(true);
    fetch(`https://jansamadhan-json-server.onrender.com/createDepartment?id=${deptIde}`)
      .then((res) => res.json())
      .then((data) => {
        setDeptData(data);
        setLoading(false);
      });
  }

  useEffect(() => {
    if (deptId) {
      getDeptData(deptId);
    }
  }, [deptId]);

  useEffect(() => {
    const staff = sessionStorage.getItem("staffName");
    const staffData = JSON.parse(staff);
    // console.log("ss",staffData);
    setDeptId(staffData.departmentId);
    setstaffId(staffData.id);
  }, []);

  if (loading) {
    return <div>Loading department data...</div>;
  }

  if (!deptData || deptData.length === 0) {
    return <div>No department data available</div>;
  }

  const department = deptData[0]; // Assuming first item is the department

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Department Information</h1>

      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <h2>{department.name}</h2>
        <p>
          <strong>Municipality:</strong> {department.municipality}
        </p>
        <p>
          <strong>Department Head UID:</strong> {department.department_head_uid}
        </p>
        <p>
          <strong>Department ID:</strong> {department.id}
        </p>
        <p>
          <strong>Created At:</strong>{" "}
          {new Date(department.createdAt).toLocaleDateString()}
        </p>

        <div style={{ marginTop: "15px" }}>
          <h3>Responsibilities:</h3>
          <ul>
            {department.responsibilities.map((responsibility, index) => (
              <li key={index}>{responsibility}</li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h2>Staff Members ({department.staffs.length})</h2>
        <div
          style={{
            display: "grid",
            gap: "15px",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          {department.staffs.map((staff, index) => (
            <div
              key={staff.id}
              style={{
                padding: "15px",
                border:
                  staff.id === staffId ? "2px solid #007bff" : "1px solid #ddd",
                borderRadius: "8px",
                backgroundColor: staff.id === staffId ? "#e7f3ff" : "#f9f9f9",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <h4 style={{ margin: 0 }}>{staff.name}</h4>
                {staff.id === staffId && (
                  <span
                    style={{
                      backgroundColor: "#007bff",
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    YOU
                  </span>
                )}
              </div>
              <p>
                <strong>ID:</strong> {staff.id}
              </p>
              <p>
                <strong>Email:</strong> {staff.email}
              </p>
              <p>
                <strong>Responsibility:</strong> {staff.responsibility}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffDepartment;
