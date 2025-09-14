from pdf2image import convert_from_path
import llm_utils
import os
import base64
from pathlib import Path
import logging
import json
import tempfile
import concurrent.futures
import time
import re

def extractfields(file_path, file_type='pdf', page_num=0):
    """
    Extract expense fields from a PDF or image file
    """
    try:
        if file_type == 'image':
            # Process image directly
            print(f"Processing image file: {file_path}")
            with open(file_path, 'rb') as image_file:
                response = llm_utils.invoke_bedrock_claude_sonnet37_with_image(
                    prompt=get_extraction_prompt(),
                    image_file=image_file
                )
            return response

        else:  # PDF processing
            print(f"Processing PDF file: {file_path}")
            # Convert PDF to images
            output_paths = convert_pdf_to_images(file_path, dpi=300, fmt='jpeg')

            if not output_paths:
                raise ValueError("No images were extracted from the PDF")

            # Get the specified page
            if page_num >= len(output_paths):
                raise ValueError(f"Page {page_num} not found in PDF. PDF has {len(output_paths)} pages.")

            image_path = output_paths[page_num]

            # Process the image
            with open(image_path, 'rb') as image_file:
                response = llm_utils.invoke_bedrock_claude_sonnet37_with_image(
                    prompt=get_extraction_prompt(),
                    image_file=image_file
                )

            # Clean up temporary image files
            for path in output_paths:
                if os.path.exists(path):
                    os.remove(path)

            return response

    except Exception as e:
        logging.error(f"Error processing file {file_path}: {str(e)}")
        print(f"Error processing file {file_path}: {str(e)}")
        raise

def get_extraction_prompt():
    """
    Returns the standard prompt for invoice extraction
    """
    return '''Please extract the following information from this invoice image and organize them into a structured format:
1. Invoice details:
   - Invoice number
   - Invoice date
   - Currency
   - Vendor/Company name
   - Expense Type (Meals /Hotel/ Conveyance /Mobile etc. )
   - Expense location (City or Town)
   - Expense country (Country of expense)
   - Number of people (only if this is a food/meal/restaurant bill)
     Note: The number of people might be labeled in various ways such as "Covers", "Guests", "PAX", "Diners",
     "Party size", "Table of X", "Persons", "People", "No. of persons", "Customers", etc.

2. Line items - for each item provide:
  - Item description
  - Quantity
  - Amount

3. Financial summary:
   - Subtotal
   - Tax amount
   - Total amount

Return the data in this exact JSON format, with no additional text or notes:
{
  "invoiceNumber": "<invoice number>",
  "date": "<date in YYYY-MM-DD format>",
  "currency": "<currency code>",
  "vendor": "<vendor name>",
  "expenseType": "<expense type>",
  "expenseLocation": "<expense location>",
  "expenseCountry": "<expense country>",
  "numberOfPeople": "<number of people if this is a food/meal/restaurant bill, otherwise null>",

  "items": [
    {
      "description": "<item description>",
      "quantity": "<item quantity>",
      "amount": "<amount without currency symbol>"
    }
  ],
  "amount": "<subtotal without currency symbol>",
  "taxes": "<tax amount without currency symbol>",
  "total": "<total amount without currency symbol>"
}

Do not include any markdown formatting, code block indicators, or additional text. Provide only the raw JSON object'''

def convert_pdf_to_images(pdf_path, dpi=300, fmt='jpeg'):
    """
    Convert a PDF file to images and save them to a folder.
    """
    image_folder = Path('temp_images')
    image_folder.mkdir(exist_ok=True)

    # Convert PDF to images
    images = convert_from_path(pdf_path, dpi=dpi, fmt=fmt)

    # Save images
    output_paths = []
    for i, image in enumerate(images):
        output_path = image_folder / f"page_{i + 1}.{fmt}"
        image.save(output_path, fmt.upper())
        output_paths.append(str(output_path))

    return output_paths

def format_line_items(items):
    """Format line items for LLM prompt"""
    if not items:
        return "No items found"

    formatted_items = []
    for idx, item in enumerate(items, 1):
        formatted_items.append(
            f"{idx}. Description: {item.get('description', 'Not provided')}\n"
            f"   Quantity: {item.get('quantity', 'Not provided')}\n"
            f"   Amount: {item.get('amount', 'Not provided')}"
        )
    return "\n".join(formatted_items)

def extract_json(response):
    """Extract JSON object from LLM response"""
    try:
        # First try to parse the entire response as JSON
        json.loads(response)
        return response
    except json.JSONDecodeError:
        # If that fails, try to extract JSON using regex
        json_pattern = r'\{[\s\S]*\}'
        matches = re.findall(json_pattern, response)

        # Try each match until we find valid JSON
        for match in matches:
            try:
                json.loads(match)
                return match
            except json.JSONDecodeError:
                continue

        return None

def check_policy_compliance(seniority, extraction_results, policy_rules):
    """
    Check if the extracted invoice data complies with policy rules using LLM.
    """
    from datetime import datetime
    current_date = datetime.now().strftime('%Y-%m-%d')

    print("policy_rules:", policy_rules)

    # Extract relevant metadata from the invoice
    invoice_country = extraction_results.get('expenseCountry', '').lower() or 'global'
    invoice_exp_type = extraction_results.get('expenseType', '').lower().replace(' ', '_') or 'all'
    employee_seniority = seniority.lower() if seniority else 'all'

    # Filter policies to only include applicable ones
    applicable_rules = filter_applicable_policies(
        policy_rules,
        invoice_country,
        employee_seniority,
        invoice_exp_type
    )

    invoice_description = f"""
Invoice Details:
- Invoice Number: {extraction_results.get('invoiceNumber', 'Not provided')}
- Invoice Date: {extraction_results.get('date', 'Not provided')}
- Vendor: {extraction_results.get('vendor', 'Not provided')}
- Currency: {extraction_results.get('currency', 'Not provided')}
- Total Amount: {extraction_results.get('total', 'Not provided')}
- Expense location: {extraction_results.get('expenseLocation', 'Not provided')}
- Expense country: {extraction_results.get('expenseCountry', 'Not provided')}
- Expense type: {extraction_results.get('expenseType', 'Not provided')}
- Employee Seniority: {seniority or 'Not provided'}
- No. of people: {extraction_results.get('numberOfPeople') or '1'}

Line Items:
{format_line_items(extraction_results.get('items', []))}
    """

    # Extract just the rule texts for the prompt
    formatted_rules = format_applicable_policies(applicable_rules)

    prompt = f"""You are an expense policy compliance checker. Your task is to check if this invoice complies with company policies.

Current date is {current_date}

EXPENSE POLICIES:
{formatted_rules}

INVOICE TO CHECK:
{invoice_description}

Employee Seniority:
{seniority}

IMPORTANT RULES TO ALWAYS CHECK:
1. Verify that the invoice has a valid invoice number
2. Check that the vendor name is provided
3. Ensure the expense date is not in the future
4. Check that the expense date complies with all timeframe policies (including maximum age of expenses)
5. Verify that all required fields are properly filled out

IMPORTANT: You must respond ONLY with a JSON object in this exact format:
{{
    "isCompliant": boolean,
    "violations": [
        {{"message": "violation description"}}
    ]
}}

Rules for your response:
1. Only output valid JSON. No additional text before or after.
2. If there are no violations, return an empty violations array.
3. Do not include explanations or notes outside the JSON.
4. Keep violation messages clear and concise.
5. Date validation instructions:
   - Today's date is {current_date}
   - Invoice date is {extraction_results.get('date', 'Not provided')}
   - You must calculate the difference in days between the invoice date and today's date
   - Flag any violation of maximum timeframe policies (such as expenses being too old)

CRITICAL INSTRUCTIONS FOR POLICY ENFORCEMENT:
- Country-specific policies ONLY apply to expenses from the specified country
- Global policies apply to all expenses regardless of country
- DO NOT apply country-specific rules from one country to invoices from a different country

Check the invoice against each policy and include any violations in the JSON response."""

    try:
        # Log diagnostics
        print(f"Applying {len(applicable_rules)} applicable policies out of {len(policy_rules)} total policies")
        print(f"Invoice metadata: Country={invoice_country}, ExpType={invoice_exp_type}, Seniority={employee_seniority}")

        # Call LLM for policy check
        response = llm_utils.invoke_bedrock_claude_sonnet_37(
            prompt=prompt,
            max_tokens=5000,
            temperature=0.1
        )

        # Extract JSON from response
        json_match = extract_json(response)
        if not json_match:
            return {
                "isCompliant": False,
                "violations": [{"message": "Failed to get valid response from policy checker"}]
            }

        result = json.loads(json_match)
        return result

    except Exception as e:
        return {
            "isCompliant": False,
            "violations": [{"message": f"Error checking policy compliance: {str(e)}"}]
        }

def filter_applicable_policies(policy_rules, invoice_country, employee_seniority, invoice_exp_type):
    """
    Filter policy rules to only include those applicable to the given invoice.
    """
    # Normalize inputs (ensure lowercase and handle None values)
    invoice_country = (invoice_country or '').lower() or 'global'
    employee_seniority = (employee_seniority or '').lower() or 'all'
    invoice_exp_type = (invoice_exp_type or '').lower().replace(' ', '_') or 'all'

    applicable_rules = []

    for rule in policy_rules:
        rule_country = (rule.get('country', '')).lower()
        rule_seniority = (rule.get('seniority', '')).lower()
        rule_exp_type = (rule.get('expenseType', '')).lower()

        # Check if rule applies to this invoice
        country_match = (rule_country == 'global' or rule_country == invoice_country)
        seniority_match = (rule_seniority == 'all' or rule_seniority == employee_seniority)
        exp_type_match = (rule_exp_type == 'all' or rule_exp_type == invoice_exp_type)

        if country_match and seniority_match and exp_type_match:
            applicable_rules.append(rule)

    return applicable_rules

def format_applicable_policies(applicable_rules):
    """
    Format the applicable policy rules for the prompt with clear and descriptive context.
    """
    formatted_policies = []

    for i, rule_obj in enumerate(applicable_rules, 1):
        # Extract rule components
        rule = rule_obj['rule']
        country = "All countries" if rule_obj['country'] == "Global" else rule_obj['country']
        seniority = "All employee levels" if rule_obj['seniority'] == "All" else f"{rule_obj['seniority']} level employees"
        expense_type = "All expense categories" if rule_obj['expenseType'] == "All" else f"{rule_obj['expenseType']} expenses"

        # Create a more readable, descriptive rule presentation
        formatted_rule = f"{i}. POLICY: {rule}\n"
        formatted_rule += f"   APPLIES TO: {country}\n"
        formatted_rule += f"   EMPLOYEE LEVEL: {seniority}\n"
        formatted_rule += f"   EXPENSE TYPE: {expense_type}"

        formatted_policies.append(formatted_rule)

    # If no rules, add a descriptive default rule
    if not formatted_policies:
        default_rule = "1. POLICY: Invoice must have valid information and comply with general expense guidelines.\n"
        default_rule += "   APPLIES TO: All countries\n"
        default_rule += "   EMPLOYEE LEVEL: All employee levels\n"
        default_rule += "   EXPENSE TYPE: All expense categories"
        formatted_policies.append(default_rule)

    return "\n".join(formatted_policies)

def get_policy_extraction_prompt():
    """
    Returns the prompt for policy extraction from documents
    """
    return '''You are a specialized AI for extracting expense policy rules from corporate documents.
Please carefully analyze this document and extract all expense policy rules.

For each policy rule you identify:
1. Extract the exact text of the policy rule
2. Determine which country it applies to (global if it applies to all countries)
3. Determine which expense type it applies to (meals, transportation, accommodation, etc.)
4. Determine which seniority level it applies to (all, junior, mid-level, senior, executive)

Look for policy statements containing keywords like:
- must, should, required, not allowed, prohibited
- approval, limit, maximum, minimum
- expense, receipt, reimbursement
- specific monetary amounts and currency symbols

Return the extracted policies in exactly this JSON format with no additional text:
{
  "policies": [
    {
      "id": "p1",
      "text": "<exact policy text>",
      "country": "<country name or 'global'>",
      "expenseType": "<expense type>",
      "seniority": "<seniority level or 'all'>",
      "confidence": 0.95,
      "approved": false
    }
  ]
}

Valid expense types (use the most appropriate one):
- meals
- transportation
- accommodation
- entertainment
- mobile
- office_supplies
- software
- hardware
- conferences
- training
- other

Valid countries (use lowercase, or 'global' if applies everywhere):
- global
- united states
- united kingdom
- germany
- france
- japan
- canada
- australia
- brazil
- india
- china
- singapore
- south korea
- mexico
- spain
- italy
- netherlands

Valid seniority levels (use the most appropriate one):
- all
- junior
- mid-level
- senior
- executive

Important:
- Extract complete policy rules with their full context
- Make sure each rule is distinct (don't duplicate rules)
- If a specific country/expense type/seniority isn't mentioned, use 'global'/'other'/'all' respectively
- Assign an appropriate confidence score between 0.7 and 0.95 based on how clearly stated the policy is
- Use the id format "p1", "p2", etc.
- Set approved to false for all extracted policies'''

def extract_policies_from_pdf(file_path, max_workers=12):
    """
    Extract policy rules from a PDF document using LLM with parallel processing.
    """
    try:
        print(f"Processing policy document: {file_path}")

        # Convert PDF to images
        start_time = time.time()
        output_paths = convert_pdf_to_images(file_path, dpi=300, fmt='jpeg')

        if not output_paths:
            raise ValueError("No images were extracted from the PDF")

        page_count = len(output_paths)
        print(f"Converted PDF to {page_count} images in {time.time() - start_time:.2f} seconds")

        all_policies = []

        # Process pages in parallel
        start_time = time.time()
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Create a dictionary of futures to their corresponding page numbers
            future_to_page = {
                executor.submit(process_page, image_path, page_num): page_num
                for page_num, image_path in enumerate(output_paths)
            }

            # Process results as they complete
            for future in concurrent.futures.as_completed(future_to_page):
                page_num = future_to_page[future]
                try:
                    page_policies = future.result()
                    if page_policies:
                        all_policies.extend(page_policies)
                        print(f"Processed page {page_num + 1}: Found {len(page_policies)} policies")
                    else:
                        print(f"Processed page {page_num + 1}: No policies found")
                except Exception as e:
                    print(f"Error processing page {page_num + 1}: {str(e)}")
                    logging.error(f"Error processing page {page_num + 1}: {str(e)}")

        processing_time = time.time() - start_time
        print(f"Processed {page_count} pages in {processing_time:.2f} seconds")
        print(f"Average time per page: {processing_time/max(1, page_count):.2f} seconds")

        # Clean up temporary image files
        for path in output_paths:
            if os.path.exists(path):
                os.remove(path)

        # Post-process to remove duplicates
        start_time = time.time()
        unique_policies = remove_duplicate_policies(all_policies)
        print(f"Removed duplicates in {time.time() - start_time:.2f} seconds. {len(all_policies)} → {len(unique_policies)} policies")

        # Reassign IDs to be sequential
        for i, policy in enumerate(unique_policies):
            policy['id'] = f"p{i+1}"

        return {
            'policies': unique_policies,
            'pageCount': page_count
        }

    except Exception as e:
        logging.error(f"Error extracting policies from {file_path}: {str(e)}")
        print(f"Error extracting policies from {file_path}: {str(e)}")
        raise

def remove_duplicate_policies(policies):
    """
    Remove duplicate or very similar policy rules
    """
    if not policies:
        return []

    # Simple deduplication based on text similarity
    unique_policies = []
    text_signatures = set()

    for policy in policies:
        # Create a simplified signature of the policy text for comparison
        text = policy['text'].lower()
        # Remove punctuation and extra spaces for comparison
        simplified = re.sub(r'[^\w\s]', '', text)
        simplified = re.sub(r'\s+', ' ', simplified).strip()

        # If this is a new unique policy, add it
        if simplified not in text_signatures:
            text_signatures.add(simplified)
            unique_policies.append(policy)

    return unique_policies

def process_page(image_path, page_num):
    """
    Process a single page image with LLM to extract policies.
    """
    try:
        page_policies = []

        # Process the image with LLM
        with open(image_path, 'rb') as image_file:
            response = llm_utils.invoke_bedrock_claude_sonnet37_with_image(
                prompt=get_policy_extraction_prompt(),
                image_file=image_file
            )

        # Extract JSON from response
        json_match = extract_json(response)
        if json_match:
            try:
                page_result = json.loads(json_match)
                # Add page number to each policy for reference
                for policy in page_result.get('policies', []):
                    policy['page'] = page_num + 1
                    page_policies.append(policy)
            except json.JSONDecodeError:
                logging.error(f"Failed to parse JSON from page {page_num + 1}")
                print(f"Failed to parse JSON from page {page_num + 1}")

        return page_policies

    except Exception as e:
        logging.error(f"Error in process_page for page {page_num + 1}: {str(e)}")
        print(f"Error in process_page for page {page_num + 1}: {str(e)}")
        raise

def extract_policies_from_text(text_content):
    """
    Extract policy rules from text content using LLM.

    Args:
        text_content (str): The text content to analyze

    Returns:
        dict: Contains extracted policies
    """
    try:
        print(f"Processing text content ({len(text_content)} characters)")

        # If text is too long, truncate it
        max_length = 50000  # Reasonable limit for LLM processing
        if len(text_content) > max_length:
            text_content = text_content[:max_length] + "... [Content truncated]"
            print(f"Text truncated to {max_length} characters")

        all_policies = []

        # Process the text with LLM
        response = llm_utils.invoke_bedrock_claude_sonnet_37(
            prompt=get_policy_extraction_prompt_for_text(text_content),
            max_tokens=4000
        )

        # Extract JSON from response
        json_match = extract_json(response)
        if json_match:
            try:
                result = json.loads(json_match)
                policies = result.get('policies', [])
                all_policies.extend(policies)
                print(f"Extracted {len(policies)} policies from text")
            except json.JSONDecodeError:
                logging.error("Failed to parse JSON from text processing")
                print("Failed to parse JSON from text processing")

        # Post-process to remove duplicates
        unique_policies = remove_duplicate_policies(all_policies)
        print(f"After deduplication: {len(all_policies)} → {len(unique_policies)} policies")

        # Reassign IDs to be sequential
        for i, policy in enumerate(unique_policies):
            policy['id'] = f"p{i+1}"

        return {
            'policies': unique_policies
        }

    except Exception as e:
        logging.error(f"Error extracting policies from text: {str(e)}")
        print(f"Error extracting policies from text: {str(e)}")
        raise

def get_policy_extraction_prompt_for_text(text_content):
    """
    Returns the prompt for policy extraction from text content
    """
    return f'''You are a specialized AI for extracting expense policy rules from text content.
Please carefully analyze this text and extract all expense policy rules.

TEXT CONTENT TO ANALYZE:
{text_content}

For each policy rule you identify:
1. Extract the exact text of the policy rule
2. Determine which country it applies to (global if it applies to all countries)
3. Determine which expense type it applies to (meals, transportation, accommodation, etc.)
4. Determine which seniority level it applies to (all, junior, mid-level, senior, executive)

Look for policy statements containing keywords like:
- must, should, required, not allowed, prohibited
- approval, limit, maximum, minimum
- expense, receipt, reimbursement
- specific monetary amounts and currency symbols

Return the extracted policies in exactly this JSON format with no additional text:
{{
  "policies": [
    {{
      "id": "p1",
      "text": "<exact policy text>",
      "country": "<country name or 'global'>",
      "expenseType": "<expense type>",
      "seniority": "<seniority level or 'all'>",
      "confidence": 0.95,
      "approved": false
    }}
  ]
}}

Valid expense types (use the most appropriate one):
- meals
- transportation
- accommodation
- entertainment
- mobile
- office_supplies
- software
- hardware
- conferences
- training
- other

Valid countries (use lowercase, or 'global' if applies everywhere):
- global
- united states
- united kingdom
- germany
- france
- japan
- canada
- australia
- brazil
- india
- china
- singapore
- south korea
- mexico
- spain
- italy
- netherlands

Valid seniority levels (use the most appropriate one):
- all
- junior
- mid-level
- senior
- executive

Important:
- Extract complete policy rules with their full context
- Make sure each rule is distinct (don't duplicate rules)
- If a specific country/expense type/seniority isn't mentioned, use 'global'/'other'/'all' respectively
- Assign an appropriate confidence score between 0.7 and 0.95 based on how clearly stated the policy is
- Use the id format "p1", "p2", etc.
- Set approved to false for all extracted policies'''