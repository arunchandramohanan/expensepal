import boto3
import json
import base64
from botocore.exceptions import ClientError

def invoke_bedrock_claude_sonnet(prompt: str, max_tokens: int = 512, temperature: float = 0.1):
    """
    Generic function to invoke Bedrock Claude model with given prompt and parameters.
    """
    client = boto3.client("bedrock-runtime", region_name="us-east-1")
    model_id = "us.anthropic.claude-3-5-sonnet-20241022-v2:0"

    native_request = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": max_tokens,
        "temperature": temperature,
        "messages": [
            {
                "role": "user",
                "content": [{"type": "text", "text": prompt}],
            }
        ],
    }

    request = json.dumps(native_request)

    try:
        response = client.invoke_model(modelId=model_id, body=request)
        model_response = json.loads(response["body"].read())
        print('''(''' + model_response["content"][0]["text"] + ''')''')

        return model_response["content"][0]["text"]

    except Exception as e:
        return {"error": str(e)}

def invoke_bedrock_claude_sonnet_37(prompt: str, max_tokens: int = 512, temperature: float = 0.1):
    """
    Generic function to invoke Bedrock Claude 3.7 model with given prompt and parameters.
    """
    client = boto3.client("bedrock-runtime", region_name="us-east-1")

    # Try to use Claude 3.7 if available, otherwise fall back to 3.5
    model_ids = [
        "us.anthropic.claude-3-7-sonnet-20250219-v1:0",
        "us.anthropic.claude-3-5-sonnet-20241022-v2:0"
    ]

    for model_id in model_ids:
        native_request = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": [
                {
                    "role": "user",
                    "content": [{"type": "text", "text": prompt}],
                }
            ],
        }

        request = json.dumps(native_request)

        try:
            response = client.invoke_model(modelId=model_id, body=request)
            model_response = json.loads(response["body"].read())
            print('''(''' + model_response["content"][0]["text"] + ''')''')

            return model_response["content"][0]["text"]

        except ClientError as e:
            if e.response['Error']['Code'] == 'ValidationException' and 'model' in str(e).lower():
                # Model not available, try next one
                continue
            else:
                # Other error, return it
                return {"error": str(e)}
        except Exception as e:
            return {"error": str(e)}

    return {"error": "No available Claude models found"}

def invoke_bedrock_claude_sonnet_with_image(prompt: str, image_file, max_tokens: int = 1000, temperature: float = 0.1):
    """
    Generic function to invoke Bedrock Claude model with given prompt and image parameters.
    """
    client = boto3.client("bedrock-runtime", region_name="us-east-1")
    model_id = "us.anthropic.claude-3-5-sonnet-20241022-v2:0"
    encoded_image = base64.b64encode(image_file.read()).decode()

    native_request = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": max_tokens,
        "temperature": temperature,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": encoded_image
                        }
                    },
                    {
                        "type": "text",
                        "text": prompt
                    }
                ],
            }
        ],
    }

    request = json.dumps(native_request)

    try:
        response = client.invoke_model(modelId=model_id, body=request)
        model_response = json.loads(response["body"].read())
        print('''(''' + model_response["content"][0]["text"] + ''')''')

        return model_response["content"][0]["text"]

    except Exception as e:
        return {"error": str(e)}

def invoke_bedrock_claude_sonnet37_with_image(prompt: str, image_file, max_tokens: int = 4000, temperature: float = 0.1):
    """
    Generic function to invoke Bedrock Claude 3.7 model with given prompt and image parameters.
    """
    client = boto3.client("bedrock-runtime", region_name="us-east-1")

    # Try to use Claude 3.7 if available, otherwise fall back to 3.5
    model_ids = [
        "us.anthropic.claude-3-7-sonnet-20250219-v1:0",
        "us.anthropic.claude-3-5-sonnet-20241022-v2:0"
    ]

    encoded_image = base64.b64encode(image_file.read()).decode()

    for model_id in model_ids:
        native_request = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/jpeg",
                                "data": encoded_image
                            }
                        },
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ],
                }
            ],
        }

        request = json.dumps(native_request)

        try:
            response = client.invoke_model(modelId=model_id, body=request)
            model_response = json.loads(response["body"].read())
            print('''(''' + model_response["content"][0]["text"] + ''')''')

            return model_response["content"][0]["text"]

        except ClientError as e:
            if e.response['Error']['Code'] == 'ValidationException' and 'model' in str(e).lower():
                # Model not available, try next one
                continue
            else:
                # Other error, return it
                return {"error": str(e)}
        except Exception as e:
            return {"error": str(e)}

    return {"error": "No available Claude models found"}