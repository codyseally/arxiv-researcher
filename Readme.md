# Arxiv Researcher

A modern web application that allows users to search and explore academic papers from arXiv. The application features a clean, responsive interface and provides real-time search results with paper details including titles, authors, publication dates, and abstracts.

## Project Structure

The project is organized into two main components:

### Frontend (`/frontend`)
- Built with React
- Components:
  - `App.jsx`: Main application container
  - `ArxivResearcher.jsx`: Core component handling the search interface and results display
- Features:
  - Real-time search functionality
  - Responsive table display of results
  - Clickable paper titles linking to PDF versions
  - Loading states and error handling
  - Modern UI with clean styling

### Backend (`/backend`)
- Built with FastAPI
- Components:
  - `main.py`: FastAPI server implementation
  - Handles paper searches through the arXiv API
  - Implements CORS for frontend communication
- Features:
  - RESTful API endpoint for paper searches
  - Efficient paper fetching with pagination
  - Error handling and validation
  - Cross-Origin Resource Sharing (CORS) support

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd "arxiv researcher/backend"
   ```

2. Create and activate a virtual environment (optional but recommended):
   ```bash
   # On macOS/Linux
   python -m venv venv
   source venv/bin/activate

   # On Windows
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd "arxiv researcher/frontend"
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

## Running the Application

1. Start the backend server:
   ```bash
   cd "arxiv researcher/backend"
   python src/main.py
   ```
   The backend server will start on http://localhost:8000

2. In a new terminal, start the frontend development server:
   ```bash
   cd "arxiv researcher/frontend"
   npm run dev
   ```
   The frontend will be available at http://localhost:3000

## Usage
1. Open your web browser and navigate to http://localhost:3000
2. Enter your search query in the search box
3. Press Enter or click the Search button
4. View the results in the table below
5. Click on paper titles to access their PDF versions

## API Endpoints

### POST `/api/search`
- Accepts JSON body with a `query` parameter
- Returns an array of paper objects containing:
  - arxiv_id: Unique identifier
  - title: Paper title
  - authors: List of authors
  - published: Publication date
  - abstract: Paper summary
  - pdf_url: Link to PDF version

## Error Handling
- Frontend displays user-friendly error messages
- Backend provides detailed error responses
- Network errors and API issues are properly handled and displayed

## Development Notes
- The backend uses FastAPI's automatic API documentation
- Access the API docs at http://localhost:8000/docs
- CORS is enabled for development (configured for all origins)
- For production deployment, update CORS settings in `main.py`