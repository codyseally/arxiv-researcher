import React, { useState } from 'react';
import axios from 'axios';

const ArxivResearcher = () => {
  const [query, setQuery] = useState('');
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e?.preventDefault(); // Handle both button click and form submit
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:8000/api/search', 
        { query: query.trim() },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setPapers(response.data);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to fetch papers');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Arxiv Researcher</h1>
      <form onSubmit={handleSearch} style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter search query"
          style={{ padding: '10px', fontSize: '16px', width: '300px', marginRight: '10px' }}
        />
        <button
          type="submit"
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px', 
            cursor: loading ? 'wait' : 'pointer',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
          }}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      
      {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}
      {error && (
        <p style={{ textAlign: 'center', color: 'red', padding: '10px', backgroundColor: '#ffebee' }}>
          {error}
        </p>
      )}
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ border: '1px solid #ddd', padding: '12px 8px' }}>Title</th>
              <th style={{ border: '1px solid #ddd', padding: '12px 8px' }}>Authors</th>
              <th style={{ border: '1px solid #ddd', padding: '12px 8px' }}>Published</th>
              <th style={{ border: '1px solid #ddd', padding: '12px 8px' }}>Summary</th>
            </tr>
          </thead>
          <tbody>
            {papers.length > 0 ? (
              papers.map((paper) => (
                <tr key={paper.arxiv_id || paper.id}>
                  <td style={{ border: '1px solid #ddd', padding: '12px 8px' }}>
                    <a 
                      href={paper.pdf_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#2196F3', textDecoration: 'none' }}
                    >
                      {paper.title}
                    </a>
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '12px 8px' }}>
                    {paper.authors && Array.isArray(paper.authors) 
                      ? paper.authors.map(author => typeof author === 'object' ? author.name : author).join(', ') 
                      : ''}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '12px 8px' }}>{paper.published}</td>
                  <td style={{ border: '1px solid #ddd', padding: '12px 8px' }}>{paper.abstract || paper.summary}</td>
                </tr>
              ))
            ) : (
              !loading && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '12px 8px' }}>
                    No results found.
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArxivResearcher; 