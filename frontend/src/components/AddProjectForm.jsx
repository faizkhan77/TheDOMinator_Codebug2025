import { useState } from "react";

const AddProjectForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    cover_image: null,
    github_link: "",
    live_demo: "",
  });

  const [loading, setLoading] = useState(false);

  // Retrieve user profile ID from localStorage
  const userProfile = JSON.parse(localStorage.getItem("userProfile"));
  const userId = userProfile?.id; // Ensure we get the ID

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, cover_image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append("user_profile", userId); // ✅ Include user_profile ID
    formDataToSend.append("title", formData.title);
    formDataToSend.append("summary", formData.summary);
    if (formData.cover_image) {
      formDataToSend.append("cover_image", formData.cover_image);
    }
    formDataToSend.append("github_link", formData.github_link);
    formDataToSend.append("live_demo", formData.live_demo);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/projects/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`, // JWT Token
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to add project");
      }

      alert("Project added successfully!");
      onClose(); // Close modal after success
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#1f1f1f] p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-white text-lg font-semibold mb-4">Add New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Project Title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full p-2 rounded bg-[#292929] text-white"
          />

          <textarea
            name="summary"
            placeholder="Project Summary"
            value={formData.summary}
            onChange={handleChange}
            required
            className="w-full p-2 rounded bg-[#292929] text-white"
          />

          <input
            type="file"
            name="cover_image"
            onChange={handleFileChange}
            className="w-full text-white"
          />

          <input
            type="url"
            name="github_link"
            placeholder="GitHub Repository URL"
            value={formData.github_link}
            onChange={handleChange}
            className="w-full p-2 rounded bg-[#292929] text-white"
          />

          <input
            type="url"
            name="live_demo"
            placeholder="Live Demo URL"
            value={formData.live_demo}
            onChange={handleChange}
            className="w-full p-2 rounded bg-[#292929] text-white"
          />

          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectForm;
