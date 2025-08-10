# base/rag_pipeline.py

import os
import time
import django

# --- Setup Django Environment for standalone script ---
# This allows us to run this file directly and still use Django models.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'HackFusion.settings')
django.setup()
# ----------------------------------------------------

from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_google_genai import GoogleGenerativeAI
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from pinecone import Pinecone
from langchain_pinecone import PineconeVectorStore
from django.conf import settings
from .models import ChatSession

from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file in the project root
load_dotenv(os.path.join(BASE_DIR, '.env'))

# --- Initialize APIs & Constants ---
PINECONE_API_KEY = os.environ.get('PINECONE_API_KEY')
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
INDEX_NAME = os.environ.get('PINECONE_INDEX_NAME')

MODEL_NAME_384_DIM = 'sentence-transformers/all-MiniLM-L6-v2'

pc = Pinecone(api_key=PINECONE_API_KEY)
embeddings_model = HuggingFaceEmbeddings(model_name=MODEL_NAME_384_DIM)
llm = GoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=GEMINI_API_KEY, temperature=0.2)

# --- RAG LOGIC USING LANGCHAIN'S ABSTRACTION CHAIN ---

def get_answer_from_rag(session_id: str, question: str):
    """
    Generates an answer using the LangChain Retrieval Chain, based on the old code's logic.
    """
    print(f"\n--- Starting RAG Chain for Session: {session_id} ---")

    # 1. Initialize Vector Store and Retriever
    # The namespace is crucial for multi-tenancy in a web app context.
    print(f"Step 1: Initializing retriever for namespace '{session_id}'...")
    vectorstore = PineconeVectorStore.from_existing_index(
        index_name=INDEX_NAME,
        embedding=embeddings_model,
        namespace=session_id
    )
    # Using 'k=3' as specified in the old code's logic.
    retriever = vectorstore.as_retriever(search_kwargs={"k": 15})

    # 2. Define Prompt Template (from old code)
    # This prompt template structures how the retrieved documents and the question
    # are presented to the language model.
    system_prompt = (
        "You are an assistant for question-answering tasks. "
        "Use the following pieces of retrieved context to answer "
        "the question. If you don't know the answer, say that you "
        "don't know. Use three sentences maximum and keep the "
        "answer concise."
        "\n\n"
        "{context}"
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            ("human", "{input}"),
        ]
    )

    # 3. Create and Invoke the RAG Chain (from old code)
    # This chain automatically handles:
    #   a. Taking the input question.
    #   b. Passing it to the retriever to get relevant documents.
    #   c. "Stuffing" the document content into the {context} part of the prompt.
    #   d. Passing the final prompt to the LLM to get an answer.
    print(f"Step 2: Creating and invoking the RAG chain for question: '{question}'")
    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    # The chain expects a dictionary with the key "input".
    response = rag_chain.invoke({"input": question})

    # The final answer is in the "answer" key of the response dictionary.
    answer = response.get("answer", "I'm sorry, I could not find an answer in the provided documents.")
    
    print("Step 3: RAG chain finished. Returning answer.")
    return answer

# --- Helper function for one-time processing ---
# This is called by the view on first question, or by the main script for testing.
# THIS FUNCTION REMAINS UNCHANGED as it's already robust.
def process_pdfs_for_session(session_id: str):
    index = pc.Index(INDEX_NAME)
    index_stats = index.describe_index_stats()
    if session_id in index_stats.get('namespaces', {}):
        print(f"Namespace '{session_id}' already exists. Skipping processing.")
        return

    print(f"Namespace '{session_id}' not found. Processing and embedding PDFs...")
    session = ChatSession.objects.get(id=session_id)
    all_docs = []
    for pdf_record in session.pdfs.all():
        pdf_path = os.path.join(settings.MEDIA_ROOT, pdf_record.file.name)
        loader = PyPDFLoader(pdf_path)
        documents = loader.load()
        all_docs.extend(documents)

    if not all_docs:
        raise Exception("No documents found for this session.")

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    text_chunks = text_splitter.split_documents(all_docs)

    print(f"Embedding {len(text_chunks)} text chunks into Pinecone under namespace '{session_id}'...")
    PineconeVectorStore.from_documents(
        documents=text_chunks, index_name=INDEX_NAME,
        embedding=embeddings_model, namespace=session_id
    )

    # Verification Loop to ensure data is indexed before proceeding
    max_retries = 30
    print("Verifying vector indexing in Pinecone...")
    for i in range(max_retries):
        stats = index.describe_index_stats()
        if session_id in stats.get('namespaces', {}) and stats['namespaces'][session_id]['vector_count'] > 0:
            print(f"Success! Confirmed {stats['namespaces'][session_id]['vector_count']} vectors in Pinecone for namespace '{session_id}'.")
            return
        time.sleep(1) # Wait for 1 second before retrying
    raise Exception(f"Timeout: Failed to verify vector indexing in Pinecone for namespace '{session_id}'.")


# --- STANDALONE TEST SCRIPT ---
# THIS REMAINS UNCHANGED and will now test the new chain-based logic.
if __name__ == '__main__':
    """
    To run this test:
    1. Make sure you have a PDF file in your `media/pdfs/` folder.
    2. Activate your virtual environment.
    3. From the project root ('backend/HackFusion'), run: python -m base.rag_pipeline
    """
    print("--- Running Standalone RAG Pipeline Test ---")

    # Create a dummy session and PDF record in the database for the test
    test_session = ChatSession.objects.create()
    session_id_to_test = str(test_session.id)

    # IMPORTANT: Update 'Medical_book.pdf' to a PDF file that actually
    # exists in your `media/pdfs/` directory.
    pdf_file_name = 'Medical_book.pdf'
    pdf_file_path_for_db = os.path.join('pdfs', pdf_file_name)
    full_pdf_path = os.path.join(settings.MEDIA_ROOT, pdf_file_path_for_db)

    if not os.path.exists(full_pdf_path):
        print(f"\nERROR: Test PDF not found at {full_pdf_path}")
        print(f"Please place '{pdf_file_name}' in your '{os.path.join(settings.MEDIA_ROOT, 'pdfs')}' folder and try again.\n")
    else:
        from django.core.files.base import ContentFile
        dummy_pdf, _ = test_session.pdfs.get_or_create(file=pdf_file_path_for_db)

        try:
            # Step 1: Process the PDFs for our test session
            process_pdfs_for_session(session_id_to_test)

            # Step 2: Ask a question
            test_question = "what is Acne and how to cure it?"

            answer = get_answer_from_rag(session_id_to_test, test_question)

            print("\n--- FINAL ANSWER ---")
            print(answer)
            print("--------------------\n")

        except Exception as e:
            print(f"\n--- TEST FAILED ---")
            print(f"An error occurred: {e}")
            print("-------------------\n")
        finally:
            # Clean up the dummy session from the database
            test_session.delete()
            print(f"Cleaned up test session {session_id_to_test}.")
            # Optional: Clean up the namespace in Pinecone
            # try:
            #     index = pc.Index(INDEX_NAME)
            #     index.delete(namespace=session_id_to_test, delete_all=True)
            #     print(f"Cleaned up Pinecone namespace '{session_id_to_test}'.")
            # except Exception as pe:
            #     print(f"Could not clean up Pinecone namespace: {pe}")