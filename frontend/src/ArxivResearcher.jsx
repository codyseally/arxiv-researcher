import React, { useState } from 'react';
import axios from 'axios';

const ArxivResearcher = () => {
  const [query, setQuery] = useState('');
  const [papers, setPapers] = useState([]);
  const [transformedQuery, setTransformedQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [queryError, setQueryError] = useState(null);

  const handleSearch = async (e) => {
    e?.preventDefault(); // Handle both button click and form submit
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setQueryError(null);
    setTransformedQuery('');
    try {
      const response = await axios.post('http://localhost:8000/api/search', 
        { query: query.trim() },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data.error) {
        setQueryError(response.data.error);
        setPapers([]);
      } else {
        setPapers(response.data.papers);
        setTransformedQuery(response.data.transformed_query);
      }
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
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Arxiv Researcher</h1>
      
      <form onSubmit={handleSearch} className="flex justify-center mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter search query"
          className="px-4 py-2 text-lg border rounded-l w-96"
        />
        <button
          type="submit"
          className={`px-6 py-2 text-lg text-white rounded-r ${
            loading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      
      {loading && <p className="text-center">Loading...</p>}
      
      {queryError && (
        <div className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
          <p className="font-bold">Query Generation Error</p>
          <p>{queryError}</p>
        </div>
      )}
      
      {error && (
        <p className="text-center text-red-600 p-4 bg-red-100 rounded">
          {error}
        </p>
      )}

      {transformedQuery && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <p className="text-sm text-gray-600">Original query: <span className="font-semibold">{query}</span></p>
          <p className="text-sm text-gray-600">Transformed query: <span className="font-semibold">{transformedQuery}</span></p>
        </div>
      )}
      
      {papers.length > 0 && (
        <div className="space-y-6">
          {papers.map((paper, index) => (
            <div key={paper.arxiv_id} className="p-4 border rounded shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-2">
                <a href={paper.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                  {paper.title}
                </a>
              </h2>
              <p className="text-sm text-gray-600 mb-2">
                Authors: {paper.authors.map(a => a.name).join(', ')}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Published: {paper.published}
              </p>
              <p className="text-sm text-gray-800 mb-2">{paper.abstract}</p>
              <div className="text-xs text-gray-500">ID: {paper.arxiv_id}</div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && papers.length === 0 && !queryError && query && (
        <p className="text-center text-gray-600">No papers found matching your query.</p>
      )}
    </div>
  );
};

export default ArxivResearcher; 