from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import arxiv
from .llm import process_query
from datetime import datetime

app = FastAPI(title="ArXiv Researcher API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchQuery(BaseModel):
    query: str

class Author(BaseModel):
    name: str

class Paper(BaseModel):
    arxiv_id: str
    title: str
    authors: List[Author]
    abstract: str
    published: str
    pdf_url: str

@app.post("/api/search", response_model=List[Paper])
async def search_papers(search_query: SearchQuery):
    try:
        # Process the natural language query using Ollama/LangChain
        processed_query = await process_query(search_query.query)
        
        # Search arXiv using the processed query
        search = arxiv.Search(
            query=processed_query,
            max_results=10,
            sort_by=arxiv.SortCriterion.Relevance
        )

        papers = []
        for result in search.results():
            paper = Paper(
                arxiv_id=result.entry_id.split('/')[-1],
                title=result.title,
                authors=[Author(name=author.name) for author in result.authors],
                abstract=result.summary,
                published=result.published.strftime("%Y-%m-%d"),
                pdf_url=result.pdf_url
            )
            papers.append(paper)

        return papers
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"} 