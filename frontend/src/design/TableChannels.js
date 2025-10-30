import React, { useState } from "react";
import { Table, Spinner } from "react-bootstrap";
import { theme } from "../theme";
import { FaChevronDown, FaChevronUp, FaFilter, FaTimes } from "react-icons/fa";
import "../styles/table.css";

// Add this function before the TableChannels component
const formatColumnName = (column) => {
  return column
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const PERMANENT_COLUMNS = ['message_id', 'chat_name', 'message_text'];

const TableChannels = ({ channels, initialShowColumns }) => {
  const [showColumns, setShowColumns] = useState(initialShowColumns);
  const [showFilter, setShowFilter] = useState(false);
  const [showNote, setShowNote] = useState(true);

  const handleToggleColumn = (column) => {
    // Don't allow toggling of permanent columns
    if (PERMANENT_COLUMNS.includes(column)) {
      return;
    }
    setShowColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };

  // Add this for debugging
  console.log("Channels data:", channels);
  console.log("Show columns:", showColumns);

  if (!channels || channels.length === 0) {
    return (
      <div className="table-wrapper-container">
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Spinner animation="border" />
          <p>Loading messages or no messages found...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      {/* Filter toggle button */}
      <div className="filter-toggle" onClick={toggleFilter}>
        <FaFilter />
        <span>Customize Columns</span>
        <span style={{ 
          transform: showFilter ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease'
        }}>▼</span>
      </div>

      {/* Column selector */}
      {showFilter && (
        <div className="column-selector-container">
          {showNote && (
            <div className="note-banner">
              <span>Note: Message ID, Chat Name, and Message Text are permanent columns</span>
              <button onClick={() => setShowNote(false)} className="note-close-button">
                <FaTimes />
              </button>
            </div>
          )}
          <div className="checkbox-group">
            {Object.keys(showColumns).map((column) => (
              <div key={column} className="checkbox-item">
                <input
                  type="checkbox"
                  id={column}
                  checked={showColumns[column]}
                  onChange={() => handleToggleColumn(column)}
                  disabled={PERMANENT_COLUMNS.includes(column)}
                />
                <label htmlFor={column}>
                  {formatColumnName(column)}
                  {PERMANENT_COLUMNS.includes(column) && 
                    <span className="required-badge">Required</span>
                  }
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-wrapper-container">
        <Table striped bordered hover>
          <thead>
            <tr>
              {Object.entries(showColumns).map(([column, show]) =>
                (PERMANENT_COLUMNS.includes(column) || show) && (
                  <th key={column}>{formatColumnName(column)}</th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {channels.map((message, index) => (
              <tr key={index}>
                {Object.entries(showColumns).map(([column, show]) =>
                  (PERMANENT_COLUMNS.includes(column) || show) && (
                    <td key={column}>
                      {column === 'date' || column === 'fetch_time' 
                        ? new Date(message[column]).toLocaleString()
                        : message[column]}
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default TableChannels;
