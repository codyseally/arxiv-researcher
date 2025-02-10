from langchain_community.llms import Ollama
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

# Initialize Ollama LLM with specific parameters
llm = Ollama(
    model="llama3.2:3b",  # Using an available model
    temperature=0.1,  # Low temperature for more deterministic outputs
    base_url="http://127.0.0.1:11434",  # Explicitly set the base URL
)

# Verify Ollama connection and model availability
async def verify_ollama():
    try:
        # Test the connection with a simple query
        result = await llm.ainvoke("test")
        return True
    except Exception as e:
        print(f"Failed to connect to Ollama: {str(e)}")
        return False

# Create a prompt template for query transformation
query_template = """You are an expert at converting natural language queries into arXiv API search queries.
Your task is to transform natural language queries into valid arXiv search syntax.

IMPORTANT: Your response must ONLY contain the transformed query, nothing else.
For title searches, you MUST output exactly: ti:"phrase" (no parentheses)
For topic searches, you MUST output exactly: (term1 AND term2)

Rules:
1. Title searches:
   Input: "papers with X in the title" or "title contains X"
   Output: ti:"X" (exactly as is, preserve case)
   Example: "papers with 'Neural Networks' in title" → ti:"Neural Networks"
   Example: "papers mentioning 'Large Concept Models' in title" → ti:"Large Concept Models"

2. Topic searches:
   Input: "papers about X and Y"
   Output: (X AND Y)
   Example: "papers about quantum computing and ML" → (quantum computing AND machine learning)

IMPORTANT NOTES:
- For title searches, use ti: instead of title:
- For title searches, preserve the exact case of the quoted phrase
- Do not add parentheses around title searches
- Keep quotes exactly as provided in the input

Examples:
Input: "Find papers with 'Graph Neural Networks' in the title"
Output: ti:"Graph Neural Networks"

Input: "Papers about machine learning and robotics"
Output: (machine learning AND robotics)

Input: "Return all papers with 'Large Concept Models' in the title"
Output: ti:"Large Concept Models"

Input: "Papers mentioning 'Quantum Computing' in title"
Output: ti:"Quantum Computing"

REMEMBER:
- Output MUST start with either 'ti:' or '('
- NO explanations or extra text
- NO repeating the input
- NO escape characters
- NO parentheses around title searches
- ONLY the transformed query
- PRESERVE CASE for title searches

Natural language query: {query}

Transformed query:"""

prompt = PromptTemplate(
    input_variables=["query"],
    template=query_template
)

# Create the chain
chain = LLMChain(llm=llm, prompt=prompt)

async def process_query(natural_query: str) -> str:
    """
    Process a natural language query using the LLM and convert it to an arXiv search query.
    Returns the transformed query if successful, or an error message if the LLM fails to generate a proper query.
    """
    try:
        # First verify Ollama connection
        if not await verify_ollama():
            return "Query could not be generated: Could not connect to Ollama. Please ensure Ollama is running and the model is installed."

        # Get the transformed query using the newer async invoke pattern
        result = await chain.ainvoke({"query": natural_query})
        # Clean up the result (remove any extra whitespace or newlines)
        transformed_query = result["text"].strip()
        
        # Validate the LLM output
        if transformed_query.lower() == natural_query.lower():
            return "Query could not be generated: LLM repeated the input query"
        
        if not (transformed_query.startswith("ti:") or transformed_query.startswith("(")):
            return "Query could not be generated: Invalid query format"
            
        if len(transformed_query.split()) < 2:  # Ensure we have at least a command and a term
            return "Query could not be generated: Query too short"
        
        # Remove any parentheses from title searches
        if transformed_query.startswith("ti:"):
            # Remove any parentheses that might be wrapping the entire query
            transformed_query = transformed_query.strip("()")
            # Ensure the quotes are preserved
            if not ('"' in transformed_query):
                # If no quotes, add them around the search term
                parts = transformed_query.split(":", 1)
                if len(parts) == 2:
                    transformed_query = f'{parts[0]}:"{parts[1].strip()}"'
            
        return transformed_query
        
    except Exception as e:
        return f"Query could not be generated: {str(e)}" 