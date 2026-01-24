'use client';

import { useState } from 'react';

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage({ text: '', type: '' });

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      // Add your API call here
      // await fetch('/api/submit', { method: 'POST', body: JSON.stringify(data) });
      
      setStatusMessage({ text: 'Project submitted successfully!', type: 'success' });
      e.target.reset();
    } catch (error) {
      setStatusMessage({ text: 'Failed to submit project. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="gradient-bg">
      <div className="gradient-blob blob-1"></div>
      <div className="gradient-blob blob-2"></div>
      <div className="gradient-blob blob-3"></div>
      
      <div className="container">
        <img src="/favicon.jpg" alt="Vibecoding Community Logo" 
             style={{width: '500px', height: '500px', borderRadius: '50%', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'}}/>
        <h1>Vibecoding Community</h1>
        <p>create, share, connect</p>
        <a href="https://www.linkedin.com/company/111056148/" className="btn" target="_blank" rel="noopener noreferrer">Join us!</a>
        <button onClick={() => setShowForm(true)} className="btn" style={{marginLeft: '1rem'}}>Add Your Project!</button>
      </div>

      {/* Project Submission Form */}
      {showForm && (
        <div className="form-container">
          <div className="form-content">
            <h2 className="form-title">Submit Your Project</h2>
            <form id="projectForm" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="projectLink">Project Link</label>
                <input type="url" id="projectLink" name="projectLink" placeholder="https://github.com/your-project" required/>
              </div>
              
              <div className="form-group">
                <label htmlFor="linkedinLink">LinkedIn Profile Link</label>
                <input type="url" id="linkedinLink" name="linkedinLink" placeholder="https://www.linkedin.com/in/your-profile" required/>
              </div>
              
              <div className="checkbox-group">
                <input type="checkbox" id="anonymous" name="anonymous"/>
                <label htmlFor="anonymous">I want to remain anonymous</label>
              </div>
              
              <div className="form-group">
                <label htmlFor="projectSlogan">Project Slogan (Short Text)</label>
                <input type="text" id="projectSlogan" name="projectSlogan" placeholder="A catchy slogan for your project" maxLength="100" required/>
              </div>
              
              <div className="form-group">
                <label htmlFor="projectContent">Project Content (Post Description)</label>
                <textarea id="projectContent" name="projectContent" placeholder="Describe your project in detail..." required></textarea>
              </div>
              
              {isLoading && (
                <div className="loading">
                  <p>Submitting your project...</p>
                </div>
              )}
              
              {statusMessage.text && (
                <div className={`status-message ${statusMessage.type}`}>
                  {statusMessage.text}
                </div>
              )}
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="btn close-btn">Cancel</button>
                <button type="submit" className="btn submit-btn" disabled={isLoading}>Submit Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}