from langchain_community.llms import Ollama
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

# Initialize Ollama LLM
llm = Ollama(model="deepseek-r1:32b")

# Create a prompt template for query transformation
query_template = """You are an expert at converting natural language queries into arXiv API search queries.
Convert the following natural language query into an appropriate arXiv search query.
Focus on extracting key terms and using appropriate operators (AND, OR, etc.).
If the user asks for papers that contain a specific expression in the title, in quotation marks, only return 
a query that searches for that complete expression in the title. For example, if the user asks for "graph networks",
only return a query that searches for "graph networks" in the title, and not papers that contain "graph" or "networks" separately, 
such as "graph neural networks" or "graph convolutional networks".
Only return the transformed query, nothing else.


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
    """
    try:
        # Get the transformed query using the newer async invoke pattern
        result = await chain.ainvoke({"query": natural_query})
        # Clean up the result (remove any extra whitespace or newlines)
        transformed_query = result["text"].strip()
        return transformed_query
    except Exception as e:
        raise Exception(f"Error processing query with LLM: {str(e)}") 