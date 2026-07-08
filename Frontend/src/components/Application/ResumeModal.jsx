

const ResumeModal = ({ imageUrl, onClose }) => {
  const isPdf = imageUrl && imageUrl.toLowerCase().endsWith(".pdf");

  return (
    <div className="resume-modal">
      <div className="modal-content" style={{ width: isPdf ? "80%" : "auto", maxWidth: isPdf ? "900px" : "600px", padding: "20px", borderRadius: "8px", position: "relative" }}>
        <span className="close" onClick={onClose} style={{ position: "absolute", right: "20px", top: "10px", fontSize: "28px", cursor: "pointer" }}>
          &times;
        </span>
        <div style={{ marginTop: "20px" }}>
          {isPdf ? (
            <iframe
              src={imageUrl}
              title="Resume PDF"
              style={{ width: "100%", height: "70vh", border: "1px solid #ddd", borderRadius: "4px" }}
            />
          ) : (
            <img src={imageUrl} alt="resume" style={{ maxWidth: "100%", maxHeight: "70vh", display: "block", margin: "0 auto" }} />
          )}
        </div>
        <div style={{ marginTop: "15px", textAlign: "center" }}>
          <a href={imageUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#2d79f3", textDecoration: "underline", fontWeight: "bold" }}>
            Open Resume in New Tab / Download
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResumeModal;