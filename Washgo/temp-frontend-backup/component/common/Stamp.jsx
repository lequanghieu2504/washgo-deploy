import React from "react";

const Stamp = ({ clientId, carwashId, numberOfStamps = 13 }) => {
  return (
    <div style={styles.container}>
      <div style={styles.stampRow}>
        {/* Generate stamps dynamically */}
        {Array.from({ length: numberOfStamps }).map((_, index) => (
          <button key={index} style={styles.stampButton}>
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f4f4f4",
  },
  stampRow: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)", // 5 stamps per row
    gap: "10px", // Spacing between stamps
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  stampButton: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#4CAF50",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "bold",
    border: "none",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  },
};

export default Stamp;
