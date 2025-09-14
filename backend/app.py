from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
import tempfile
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Create upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Import the modules
import expensereportextractor
import llm_utils
import requests
from urllib.parse import urlparse

@app.route("/")
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

@app.route("/expenseextractor", methods=['POST'])
def extract_expense():
    """
    Extract expense data from uploaded receipts (PDF/JPG)
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # Get file type from request
        file_type = request.form.get('fileType', 'pdf')  # Default to pdf if not specified

        # Validate file type
        if file_type not in ['pdf', 'image']:
            return jsonify({'error': 'Invalid file type. Must be pdf or image'}), 400

        # Generate a unique filename with appropriate extension
        extension = 'pdf' if file_type == 'pdf' else 'jpg'
        temp_filename = f"temp_{str(uuid.uuid4())}.{extension}"
        temp_path = os.path.join(UPLOAD_FOLDER, temp_filename)

        try:
            # Save the uploaded file temporarily
            file.save(temp_path)

            # Process based on file type
            if file_type == 'pdf':
                print("Processing PDF file")
                jsonresponse = expensereportextractor.extractfields(temp_path, file_type='pdf')
            else:
                print("Processing image file")
                jsonresponse = expensereportextractor.extractfields(temp_path, file_type='image')

            return jsonresponse

        finally:
            # Clean up: remove temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)

    except Exception as e:
        print(f"Error in extract_expense: {str(e)}")
        return jsonify({
            'error': f'Failed to process file: {str(e)}'
        }), 500

@app.route("/policyextractionfromdocument", methods=['POST'])
def policy_extraction_from_document():
    """
    Extract expense policies from uploaded policy documents
    """
    print("in policy_extraction_from_document")
    try:
        # Check if the request has the file part
        if 'file' not in request.files:
            return jsonify({
                'error': 'No file provided',
                'policies': []
            }), 400

        file = request.files['file']

        # If user does not select file, browser might submit an empty file
        if file.filename == '':
            return jsonify({
                'error': 'No file selected',
                'policies': []
            }), 400

        # Check if it's a PDF file
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({
                'error': 'Uploaded file must be a PDF',
                'policies': []
            }), 400

        # Create a temporary file to store the uploaded PDF
        temp_dir = tempfile.gettempdir()
        temp_file_path = os.path.join(temp_dir, file.filename)
        file.save(temp_file_path)

        # Process the PDF file to extract policies
        extraction_result = expensereportextractor.extract_policies_from_pdf(temp_file_path)

        # Clean up the temporary file
        try:
            os.remove(temp_file_path)
        except Exception as e:
            print(f"Error removing temporary file: {str(e)}")

        # Return the extracted policies and metadata
        return jsonify({
            'policies': extraction_result['policies'],
            'pageCount': extraction_result['pageCount'],
            'metadata': {
                'fileName': file.filename,
                'processingDate': datetime.now().isoformat()
            }
        })

    except Exception as e:
        return jsonify({
            'error': f'Error processing document: {str(e)}',
            'policies': []
        }), 500

@app.route("/expensepolicycheck", methods=['POST'])
def expense_policy_check():
    """
    Check if expenses comply with company policies
    """
    try:
        # Get the request data
        data = request.get_json()
        if not data:
            return jsonify({
                'isCompliant': False,
                'violations': [{'message': 'No data provided'}]
            }), 400

        # Extract the policy rules and invoice data
        policy_rules = data.pop('policyRules', [])
        seniority = data.pop('seniority', None)
        extraction_results = data  # The remaining data is the extraction results
        print("policy_rules", policy_rules)
        print("seniority", seniority)

        # Pass both to the policy compliance checker
        result = expensereportextractor.check_policy_compliance(seniority, extraction_results, policy_rules)

        return jsonify(result)

    except Exception as e:
        return jsonify({
            'isCompliant': False,
            'violations': [{'message': f'Error processing request: {str(e)}'}]
        }), 500

@app.route("/policyextractionfromurl", methods=['POST'])
def policy_extraction_from_url():
    """
    Extract expense policies from a web URL
    """
    print("in policy_extraction_from_url")
    try:
        # Get the request data
        data = request.get_json()
        if not data or 'url' not in data:
            return jsonify({
                'error': 'No URL provided',
                'policies': []
            }), 400

        url = data['url']

        # Validate URL format
        try:
            parsed_url = urlparse(url)
            if not all([parsed_url.scheme, parsed_url.netloc]):
                raise ValueError("Invalid URL format")
        except Exception:
            return jsonify({
                'error': 'Invalid URL format. Please provide a valid HTTP/HTTPS URL.',
                'policies': []
            }), 400

        # Fetch content from URL
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()

            # Check if content is too large (limit to 1MB)
            if len(response.content) > 1024 * 1024:
                return jsonify({
                    'error': 'Content from URL is too large (max 1MB)',
                    'policies': []
                }), 400

        except requests.exceptions.Timeout:
            return jsonify({
                'error': 'Request timeout. The URL took too long to respond.',
                'policies': []
            }), 400
        except requests.exceptions.RequestException as e:
            return jsonify({
                'error': f'Failed to fetch content from URL: {str(e)}',
                'policies': []
            }), 400

        # Extract text content from HTML or plain text
        content_type = response.headers.get('content-type', '').lower()

        if 'html' in content_type:
            # For HTML content, extract text using simple parsing
            try:
                from bs4 import BeautifulSoup
                soup = BeautifulSoup(response.content, 'html.parser')
                # Remove script and style elements
                for script in soup(["script", "style"]):
                    script.decompose()
                text_content = soup.get_text()
            except ImportError:
                # Fallback: simple HTML tag removal
                import re
                text_content = re.sub('<[^<]+?>', '', response.text)
        else:
            # Plain text content
            text_content = response.text

        # Clean up the text content
        lines = [line.strip() for line in text_content.split('\n') if line.strip()]
        cleaned_content = '\n'.join(lines)

        if not cleaned_content:
            return jsonify({
                'error': 'No text content found at the provided URL',
                'policies': []
            }), 400

        # Extract policies using LLM
        extraction_result = expensereportextractor.extract_policies_from_text(cleaned_content)

        # Return the extracted policies and metadata
        return jsonify({
            'policies': extraction_result['policies'],
            'metadata': {
                'url': url,
                'contentLength': len(cleaned_content),
                'processingDate': datetime.now().isoformat()
            }
        })

    except Exception as e:
        print(f"Error in policy_extraction_from_url: {str(e)}")
        return jsonify({
            'error': f'Error processing URL: {str(e)}',
            'policies': []
        }), 500

if __name__ == '__main__':
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 3042))
    debug = os.getenv('DEBUG', 'True').lower() == 'true'
    app.run(host=host, port=port, debug=debug)