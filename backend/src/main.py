from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import arxiv
import uvicorn
import json
from llm import process_query  # Import the LLM query processor

app = FastAPI()

# Enable CORS - update to handle all origins in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchQuery(BaseModel):
    query: str

@app.post("/api/search")
async def search_papers(request: Request):
    try:
        # Parse the request body
        body = await request.json()
        user_query = body.get('query', '')
        
        if not user_query:
            raise HTTPException(status_code=400, detail="Query is required")

        # Process the query through LLM
        arxiv_query = await process_query(user_query)

        # Check if query generation failed
        if arxiv_query.startswith("Query could not be generated"):
            return {
                "original_query": user_query,
                "transformed_query": None,
                "papers": [],
                "error": arxiv_query
            }

        # Create a client with appropriate parameters
        client = arxiv.Client(
            page_size=50,
            delay_seconds=3,
            num_retries=3
        )

        # Clean up the query if needed
        clean_query = arxiv_query.strip()
        if clean_query.startswith("ti:"):
            # Remove any parentheses that might be wrapping the entire query
            clean_query = clean_query.strip("()")

        # Search arxiv with the processed query
        search = arxiv.Search(
            query=clean_query,
            max_results=50,
            sort_by=arxiv.SortCriterion.SubmittedDate
        )

        # Get results
        results = []
        try:
            for result in client.results(search):
                paper = {
                    "arxiv_id": result.entry_id.split("/")[-1],
                    "title": result.title,
                    "authors": [{"name": author.name} for author in result.authors],
                    "published": result.published.strftime("%Y-%m-%d"),
                    "abstract": result.summary,
                    "pdf_url": result.pdf_url,
                    "query_match_explanation": f"This paper was found using the transformed query: {arxiv_query}"
                }
                results.append(paper)
        except Exception as search_error:
            print(f"Error during arxiv search: {str(search_error)}")
            raise HTTPException(status_code=500, detail=f"Error searching arxiv: {str(search_error)}")

        if not results:
            return {
                "original_query": user_query,
                "transformed_query": arxiv_query,
                "papers": [],
                "message": "No papers found matching your query"
            }

        # Sort results by published date in descending order
        results.sort(key=lambda x: x["published"], reverse=True)
        
        return {
            "original_query": user_query,
            "transformed_query": arxiv_query,
            "papers": results
        }
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    except Exception as e:
        print(f"Error processing request: {str(e)}")  # Add logging
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 