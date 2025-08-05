import React, { useState, useEffect } from 'react';

function Dashboard({ payload }) {
  const [file, setFile] = useState();
  const [url, setUrl] = useState();
  const [data, setData] = useState();
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleUpload = async () => {
    const formData = new FormData();
    const token = localStorage.getItem("token");
    formData.append('file', file);
    const res = await fetch("http://localhost:3000/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
    const d = await res.json();
    setUrl(d.url);
    await getUser();
  };

  const getUser = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3000/files", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const d = await res.json();
    setData(d);
  };

  useEffect(() => {
    getUser();
  }, []);

  const toggleSelect = (file) => {
    setSelectedFiles((prev) =>
      prev.includes(file.url)
        ? prev.filter((url) => url !== file.url)
        : [...prev, file.url]
    );
  };

  const handleMerge = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3000/merge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ files: selectedFiles })
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "merged.pdf";
    link.click();
  };

 return (
  <div className="dashboard-container">
    <h1>Welcome, {payload.username}</h1>

    <div className="file-upload-section">
      <label>Upload a File</label>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button className="upload-btn" onClick={handleUpload}>Upload</button>

    </div>

    <div className="file-list-section">
      <h2>Your Files</h2>
      {data?.files?.length > 0 ? (
        <ul className="file-list">
          {data.files.map((f, i) => (
            <li key={i}>
              <a href={f.url} target="_blank" rel="noopener noreferrer">{f.filename}</a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No files uploaded yet.</p>
      )}
    </div>

    <div className="merge-section">
      <h2>Select Files to Merge</h2>
      {data?.files?.length > 0 ? (
        data.files.map((f, i) => (
          <div key={i} className="file-checkbox">
            <input
              type="checkbox"
              checked={selectedFiles.includes(f.url)}
              onChange={() => toggleSelect(f)}
            />
            <label>{f.filename}</label>
          </div>
        ))
      ) : (
        <p>No files to merge.</p>
      )}
      <button className="upload-btn" onClick={handleMerge}>Merge</button>

    </div>
  </div>
);
}

export default Dashboard;
