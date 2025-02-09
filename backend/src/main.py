from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import arxiv
import uvicorn
import json

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
        query = body.get('query', '')
        
        if not query:
            raise HTTPException(status_code=400, detail="Query is required")

        # Create a client with appropriate parameters
        client = arxiv.Client(
            page_size=10,
            delay_seconds=3,
            num_retries=3
        )

        # Search arxiv
        search = arxiv.Search(
            query=query,
            max_results=10,
            sort_by=arxiv.SortCriterion.Relevance
        )

        # Get results
        results = []
        for result in client.results(search):
            paper = {
                "arxiv_id": result.entry_id.split("/")[-1],
                "title": result.title,
                "authors": [{"name": author.name} for author in result.authors],
                "published": result.published.strftime("%Y-%m-%d"),
                "abstract": result.summary,
                "pdf_url": result.pdf_url
            }
            results.append(paper)

        return results
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    except Exception as e:
        print(f"Error processing request: {str(e)}")  # Add logging
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 