'use client';

import { useState } from 'react';

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [formData, setFormData] = useState({
    projectLink: '',
    linkedinLink: '',
    anonymous: false,
    projectSlogan: '',
    projectContent: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage({ text: '', type: '' });

    try {
      const response = await fetch('/api/submit-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatusMessage({ text: 'Projeniz başarıyla gönderildi!', type: 'success' });
        setFormData({
          projectLink: '',
          linkedinLink: '',
          anonymous: false,
          projectSlogan: '',
          projectContent: ''
        });
        setTimeout(() => setShowForm(false), 2000);
      } else {
        throw new Error('Gönderim başarısız');
      }
    } catch (error) {
      setStatusMessage({ text: 'Bir hata oluştu. Lütfen tekrar deneyin.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setStatusMessage({ text: '', type: '' });
    setFormData({
      projectLink: '',
      linkedinLink: '',
      anonymous: false,
      projectSlogan: '',
      projectContent: ''
    });
  };

  return (
    <div className="gradient-bg">
      <div className="gradient-blob blob-1"></div>
      <div className="gradient-blob blob-2"></div>
      <div className="gradient-blob blob-3"></div>
      
      <div className="container">
        <img 
          src="/favicon.jpg" 
          alt="Vibecoding Community Logo" 
          className="logo-image"
        />
        <h1>Vibecoding Community</h1>
        <p>create, share, connect</p>
        <div className="button-group">
          <a href="https://www.linkedin.com/company/111056148/" className="btn" target="_blank" rel="noopener noreferrer">Join us!</a>
          <button onClick={() => setShowForm(true)} className="btn">Add Your Project!</button>
        </div>
      </div>

      {showForm && (
        <div className="form-container">
          <div className="form-content">
            <h2 className="form-title">Submit Your Project</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="projectLink">Project Link</label>
                <input 
                  type="url" 
                  id="projectLink" 
                  name="projectLink" 
                  placeholder="https://github.com/your-project" 
                  value={formData.projectLink}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="linkedinLink">LinkedIn Profile Link</label>
                <input 
                  type="url" 
                  id="linkedinLink" 
                  name="linkedinLink" 
                  placeholder="https://www.linkedin.com/in/your-profile" 
                  value={formData.linkedinLink}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="checkbox-group">
                <input 
                  type="checkbox" 
                  id="anonymous" 
                  name="anonymous"
                  checked={formData.anonymous}
                  onChange={handleInputChange}
                />
                <label htmlFor="anonymous">I want to remain anonymous</label>
              </div>
              
              <div className="form-group">
                <label htmlFor="projectSlogan">Project Slogan (Short Text)</label>
                <input 
                  type="text" 
                  id="projectSlogan" 
                  name="projectSlogan" 
                  placeholder="A catchy slogan for your project" 
                  maxLength="100" 
                  value={formData.projectSlogan}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="projectContent">Project Content (Post Description)</label>
                <textarea 
                  id="projectContent" 
                  name="projectContent" 
                  placeholder="Describe your project in detail..." 
                  value={formData.projectContent}
                  onChange={handleInputChange}
                  required
                />
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
                <button type="button" onClick={handleCloseForm} className="btn close-btn" disabled={isLoading}>Cancel</button>
                <button type="submit" className="btn submit-btn" disabled={isLoading}>
                  {isLoading ? 'Submitting...' : 'Submit Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}