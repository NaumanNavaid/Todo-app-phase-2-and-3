"""
Run all tests for the Todo API
"""

import subprocess
import sys


def run_test(script_name: str, description: str):
    """Run a test script and report results"""
    print(f"\n{'='*60}")
    print(f"Running: {description}")
    print(f"Script: {script_name}")
    print('='*60)

    try:
        result = subprocess.run(
            [sys.executable, script_name],
            capture_output=False,
            text=True
        )
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Error running {script_name}: {e}")
        return False


def main():
    """Run all test suites"""
    print("\n" + "="*60)
    print("TODO API - RUNNING ALL TESTS")
    print("="*60)

    tests = [
        ("tests/test_api.py", "API Endpoint Tests"),
        ("tests/test_chatbot.py", "Chatbot Integration Tests")
    ]

    results = {}
    for script, desc in tests:
        results[desc] = run_test(script, desc)

    print("\n" + "="*60)
    print("FINAL TEST SUMMARY")
    print("="*60)
    for test, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test}")

    total = len(results)
    passed = sum(1 for p in results.values() if p)
    print(f"\nTotal: {passed}/{total} test suites passed")
    print("="*60)

    return all(results.values())


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
