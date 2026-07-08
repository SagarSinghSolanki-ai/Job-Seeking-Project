import axios from "axios";
import { useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Context } from "../../main";
import { Sparkles, Loader2 } from "lucide-react";

const Application = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [resume, setResume] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [job, setJob] = useState(null);

  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (!isAuthorized || user?.role === "Employer") {
      navigateTo("/");
    }
  }, [isAuthorized, user, navigateTo]);

  useEffect(() => {
    axios
      .get(`https://jobzee-backend-ph70.onrender.com/api/v1/job/${id}`, { withCredentials: true })
      .then((res) => {
        setJob(res.data.job);
      })
      .catch((err) => {
        console.error("Failed to fetch job details:", err);
      });
  }, [id]);

  const handleAiParse = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF resume for AI auto-fill!");
      return;
    }

    setParsing(true);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const { data } = await axios.post(
        "https://jobzee-backend-ph70.onrender.com/api/v1/ai/parse",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (data.success) {
        if (data.isScanned) {
          toast.error(data.message, { duration: 8000 });
          setResume(null);
          const fileInput = document.querySelector("input[type='file']");
          if (fileInput) fileInput.value = "";
          return;
        }
        setName(data.data.name || "");
        setEmail(data.data.email || "");
        setPhone(data.data.phone || "");
        setAddress(data.data.address || "");
        setCoverLetter(data.data.coverLetter || "");
        toast.success(
          data.isMock
            ? "[Demo Mode] Form filled using simulated parser."
            : "Form auto-filled successfully using Gemini AI Parsing!"
        );
      }
    } catch (err) {
      toast.error("AI Parsing failed. Please fill manually.");
      console.error(err);
    } finally {
      setParsing(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setResume(file);
    if (file && file.type === "application/pdf") {
      handleAiParse(file);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!job) {
      toast.error("Job details not loaded yet.");
      return;
    }
    setGenerating(true);
    try {
      const { data } = await axios.post(
        "https://jobzee-backend-ph70.onrender.com/api/v1/ai/cover-letter",
        {
          jobDescription: job.description,
          candidateProfile: `Name: ${name || "Candidate"}. Address: ${address || ""}. Contact: ${phone || ""}.`
        },
        { withCredentials: true }
      );
      if (data.success) {
        setCoverLetter(data.coverLetter);
        toast.success(
          data.isMock
            ? "[Demo Mode] Cover letter generated successfully."
            : "AI Cover letter generated using Gemini!"
        );
      }
    } catch (err) {
      toast.error("Failed to generate cover letter via AI.");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleApplication = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("address", address);
    formData.append("coverLetter", coverLetter);
    formData.append("resume", resume);
    formData.append("jobId", id);

    try {
      const { data } = await axios.post(
        "https://jobzee-backend-ph70.onrender.com/api/v1/application/post",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setName("");
      setEmail("");
      setCoverLetter("");
      setPhone("");
      setAddress("");
      setResume(null);
      toast.success(data.message);
      navigateTo("/job/getall");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit application.");
    }
  };

  return (
    <section className="application page">
      <div className="container">
        <div className="page-header">
          <span className="section-label">Apply Now</span>
          <h3>Submit Your Application</h3>
          <p>Upload your PDF resume to auto-fill details, or fill manually.</p>
        </div>
        <form onSubmit={handleApplication}>
          {/* AI Helper Banner */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "15px",
              background: "var(--accent-light)",
              border: "1px dashed var(--accent)",
              borderRadius: "8px",
              marginBottom: "20px"
            }}
          >
            <Sparkles size={20} style={{ color: "var(--accent)" }} />
            <span style={{ fontSize: "14px", color: "var(--text)" }}>
              <strong>AI Magic Triggered:</strong> Uploading a PDF resume will automatically fill name, email, phone, address, and draft a cover letter.
            </span>
          </div>

          <div className="form-group">
            <label>Resume (PDF for AI Parse Auto-fill)</label>
            <div className="file-input">
              <input
                type="file"
                accept=".pdf,.jpg,.png"
                onChange={handleFileChange}
                required
              />
            </div>
            {parsing && (
              <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--accent)", fontSize: "13px", marginTop: "5px" }}>
                <Loader2 size={14} className="animate-spin" /> Gemini AI is parsing your resume...
              </span>
            )}
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="number"
              placeholder="Your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              placeholder="Your address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ margin: 0 }}>Cover Letter</label>
              <button
                type="button"
                onClick={handleGenerateCoverLetter}
                disabled={generating}
                style={{
                  padding: "4px 10px",
                  background: "var(--accent)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Generate with AI
              </button>
            </div>
            <textarea
              placeholder="Tell us why you're a great fit for this role..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              required
              rows={8}
            />
          </div>

          <button type="submit">Submit Application</button>
        </form>
      </div>
    </section>
  );
};

export default Application;
