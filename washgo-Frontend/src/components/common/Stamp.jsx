import React, { useEffect, useState } from "react";

const Stamp = ({ clientId, carwashId, open, onClose, anchorRef }) => {
  const [currentStamps, setCurrentStamps] = useState(0);
  const [loading, setLoading] = useState(true);

  // Always show 5 stamps per row, max is 5
  const maxStamps = 5;

  // Fetch current stamp count from API (response is just a number)
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(
      `http://localhost:8080/api/stamps/client/${clientId}/carwash/${carwashId}`
    )
      .then((res) => res.json())
      .then((data) => {
        // If backend returns { count: number }
        setCurrentStamps(typeof data === "number" ? data : data?.count ?? 0);
      })
      .catch(() => setCurrentStamps(0))
      .finally(() => setLoading(false));
  }, [clientId, carwashId, open]);

  // Position dropdown above anchorRef
  const [dropdownStyle, setDropdownStyle] = useState({});
  useEffect(() => {
    if (open && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        left: rect.left + rect.width / 2 - 120,
        top: rect.top - 120,
        zIndex: 9999,
      });
    }
  }, [open, anchorRef]);

  if (!open) return null;

  return (
    <div style={{ ...styles.dropdown, ...dropdownStyle }}>
      <div style={styles.header}>
        <span>Stamps</span>
        <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      <div style={styles.stampRow}>
        {Array.from({ length: maxStamps }).map((_, index) => (
          <div
            key={index}
            style={{
              ...styles.stampCircle,
              background: index < currentStamps ? "#4CAF50" : "#e0e0e0",
              color: index < currentStamps ? "#fff" : "#888",
            }}
          >
            {index + 1}
          </div>
        ))}
      </div>
      {loading && (
        <div style={{ textAlign: "center", color: "#888", marginTop: 8 }}>
          Loading...
        </div>
      )}
    </div>
  );
};

const styles = {
  dropdown: {
    minWidth: 240,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
    padding: 16,
    border: "1px solid #e0e0e0",
    animation: "fadeIn 0.2s",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 12,
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 20,
    cursor: "pointer",
    color: "#888",
    lineHeight: 1,
  },
  stampRow: {
    display: "flex",
    gap: "10px",
    padding: "6px 0",
  },
  stampCircle: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: "15px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
    transition: "background 0.2s, color 0.2s",
    userSelect: "none",
  },
};

export default Stamp;
