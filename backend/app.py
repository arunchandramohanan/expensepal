from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
import tempfile
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Create upload folder
UPLOAD_FOLDER = '/home/ubuntu/webapp/expensepal/backend/uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Import the modules
import expensereportextractor
import llm_utils

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3042, debug=True)