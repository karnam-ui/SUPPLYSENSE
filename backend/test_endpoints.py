"""Test script to verify all endpoints are working."""
import requests
import json
import time
import sys
from typing import Optional

BASE_URL = "http://localhost:8000"
TIMEOUT = 10

# Colors for output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'


def print_header(text: str) -> None:
    """Print a formatted header."""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text:^60}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.ENDC}\n")


def print_success(text: str) -> None:
    """Print a success message."""
    print(f"{Colors.GREEN}✓ {text}{Colors.ENDC}")


def print_error(text: str) -> None:
    """Print an error message."""
    print(f"{Colors.RED}✗ {text}{Colors.ENDC}")


def print_warning(text: str) -> None:
    """Print a warning message."""
    print(f"{Colors.YELLOW}⚠ {text}{Colors.ENDC}")


def print_info(text: str) -> None:
    """Print an info message."""
    print(f"{Colors.BLUE}ℹ {text}{Colors.ENDC}")


def test_endpoint(
    method: str,
    endpoint: str,
    expected_status: int = 200,
    json_data: Optional[dict] = None,
    description: str = ""
) -> bool:
    """
    Test an API endpoint.
    
    Args:
        method: HTTP method (GET, POST, etc.)
        endpoint: API endpoint path
        expected_status: Expected HTTP status code
        json_data: Optional JSON data to send
        description: Description of the test
        
    Returns:
        True if test passed
    """
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, timeout=TIMEOUT)
        elif method == "POST":
            response = requests.post(url, json=json_data, timeout=TIMEOUT)
        else:
            print_error(f"Unknown method: {method}")
            return False
        
        if response.status_code == expected_status:
            data = response.json()
            print_success(f"{method} {endpoint} - {description}")
            print_info(f"Response: {json.dumps(data, indent=2, default=str)[:200]}...")
            return True
        else:
            print_error(
                f"{method} {endpoint} - Expected {expected_status}, "
                f"got {response.status_code}"
            )
            return False
    
    except requests.exceptions.ConnectionError:
        print_error(f"Connection refused - Is the server running on {BASE_URL}?")
        return False
    except Exception as e:
        print_error(f"{method} {endpoint} - {str(e)}")
        return False


def check_server_health() -> bool:
    """Check if the server is running."""
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        return response.status_code == 200
    except:
        return False


def main() -> int:
    """Run all tests."""
    print_header("SupplySense Backend Test Suite")
    
    # Check server health
    print_info("Checking server health...")
    for attempt in range(5):
        if check_server_health():
            print_success("Server is running")
            break
        if attempt < 4:
            print_info(f"Retrying... ({attempt + 1}/5)")
            time.sleep(1)
    else:
        print_error("Server is not responding. Make sure it's running on port 8000.")
        return 1
    
    passed = 0
    failed = 0
    
    # Test endpoints
    tests = [
        ("GET", "/", 200, None, "API root"),
        ("GET", "/health", 200, None, "Health check"),
        ("GET", "/dashboard", 200, None, "Dashboard KPIs"),
        ("GET", "/suppliers", 200, None, "All suppliers"),
        ("GET", "/inventory", 200, None, "All inventory"),
        ("GET", "/orders", 200, None, "Recent orders"),
        ("GET", "/alerts", 200, None, "Active alerts"),
        ("GET", "/forecast/1", 200, None, "Demand forecast"),
        ("POST", "/query", 200, {"question": "What is the status?"}, "AI query"),
    ]
    
    print_header("Testing Endpoints")
    
    for method, endpoint, status, data, desc in tests:
        if test_endpoint(method, endpoint, status, data, desc):
            passed += 1
        else:
            failed += 1
        print()
    
    # Summary
    print_header("Test Summary")
    print_info(f"Total tests: {passed + failed}")
    print_success(f"Passed: {passed}")
    if failed > 0:
        print_error(f"Failed: {failed}")
    
    print()
    
    # Check cache
    print_header("Checking Cache")
    try:
        import redis
        try:
            cache = redis.from_url("redis://localhost:6379/0")
            cache.ping()
            print_success("Redis cache is connected")
        except:
            print_warning("Redis cache is not available (optional)")
    except ImportError:
        print_warning("Redis module not installed")
    
    # Check Ollama
    print()
    print_header("Checking Ollama AI")
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            print_success("Ollama is available")
        else:
            print_warning("Ollama not responding properly")
    except:
        print_warning("Ollama is not available (optional)")
    
    # Final summary
    print()
    if failed == 0:
        print_header("All Tests Passed! ✓")
        return 0
    else:
        print_header(f"Some Tests Failed ({failed} failures)")
        return 1


if __name__ == "__main__":
    sys.exit(main())
