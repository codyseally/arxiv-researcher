import React, { useState } from 'react';
import axios from 'axios';

const ArxivResearcher = () => {
  const [query, setQuery] = useState('');
  const [papers, setPapers] = useState([]);
  const [transformedQuery, setTransformedQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [queryError, setQueryError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false); // Track if search has been performed

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setQueryError(null);
    setTransformedQuery('');
    setHasSearched(true); // Mark that a search has been performed
    
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
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Hero Search Section - Centered at the top */}
      <div className="w-full bg-[#1a1a1a] flex justify-center py-8 sticky top-0 z-10">
        <div className="w-full max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-6xl font-bold text-center">arXiv Researcher</h1>
            <form onSubmit={handleSearch} className="w-full">
              <div className="flex flex-col items-center gap-4">
                <label htmlFor="search-input" className="text-2xl font-medium">
                  Search Query
                </label>
                <div className="w-full flex gap-4">
                  <input
                    id="search-input"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your search query (e.g., 'papers with Large Language Models in the title')"
                    className="w-full px-6 py-4 text-lg bg-[#2a2a2a] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-32 px-8 py-4 text-lg font-medium rounded-lg shadow-sm ${
                      loading ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Content Section - Only shown after search */}
      {hasSearched && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Status Messages */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-pulse text-gray-300">Searching papers...</div>
            </div>
          )}

          {queryError && (
            <div className="mb-6 p-4 bg-yellow-900/50 border-l-4 border-yellow-500 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-500">Query Generation Error</h3>
                  <p className="mt-2 text-sm text-yellow-400">{queryError}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border-l-4 border-red-500 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-500">Error</h3>
                  <p className="mt-2 text-sm text-red-400">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results Section */}
          {papers.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Search Results</h2>
              {papers.map((paper) => (
                <article key={paper.arxiv_id} className="bg-[#2a2a2a] p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-700">
                  <h3 className="text-xl font-semibold mb-2">
                    <a href={paper.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                      {paper.title}
                    </a>
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {paper.authors.map((author, idx) => (
                      <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-900/50 text-blue-200">
                        {author.name}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-400 mb-2">Published: {paper.published}</p>
                  <p className="text-gray-300 mb-4 leading-relaxed">{paper.abstract}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">ID: {paper.arxiv_id}</span>
                    <a
                      href={paper.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      View PDF
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && papers.length === 0 && !queryError && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-300">No papers found</h3>
              <p className="mt-1 text-sm text-gray-400">Try adjusting your search query or using different keywords.</p>
            </div>
          )}
        </main>
      )}
    </div>
  );
};

export default ArxivResearcher; 