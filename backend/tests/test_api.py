"""
Test script for Todo API endpoints
Run with: python tests/test_api.py
"""

import requests
import json
from typing import Optional

# API base URL
BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api"

class TestAPI:
    def __init__(self):
        self.token: Optional[str] = None
        self.user_id: Optional[str] = None
        self.task_id: Optional[str] = None

    def print_response(self, response, title):
        """Pretty print API response"""
        print(f"\n{'='*60}")
        print(f"{title}")
        print(f"{'='*60}")
        print(f"Status Code: {response.status_code}")
        try:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except:
            print(f"Response: {response.text}")

    def register(self):
        """Test user registration"""
        print("\n[1] Testing Registration...")
        data = {
            "email": "testuser@example.com",
            "password": "test12345",
            "name": "Test User"
        }
        response = requests.post(f"{API_URL}/auth/register", json=data)
        self.print_response(response, "Register User")
        if response.status_code == 201:
            self.user_id = response.json()["id"]
        return response.status_code == 201

    def login(self):
        """Test user login"""
        print("\n[2] Testing Login...")
        data = {
            "email": "testuser@example.com",
            "password": "test12345"
        }
        response = requests.post(f"{API_URL}/auth/login", json=data)
        self.print_response(response, "Login User")
        if response.status_code == 200:
            self.token = response.json()["access_token"]
            self.user_id = response.json()["user"]["id"]
        return response.status_code == 200

    def get_headers(self):
        """Get headers with auth token"""
        return {"Authorization": f"Bearer {self.token}"}

    def create_task(self):
        """Test creating a task"""
        print("\n[3] Testing Create Task...")
        data = {
            "title": "Test Task from API",
            "description": "This is a test task"
        }
        response = requests.post(
            f"{API_URL}/tasks",
            json=data,
            headers=self.get_headers()
        )
        self.print_response(response, "Create Task")
        if response.status_code == 201:
            self.task_id = response.json()["id"]
        return response.status_code == 201

    def list_tasks(self):
        """Test listing tasks"""
        print("\n[4] Testing List Tasks...")
        response = requests.get(
            f"{API_URL}/tasks",
            headers=self.get_headers()
        )
        self.print_response(response, "List Tasks")
        return response.status_code == 200

    def get_task(self):
        """Test getting a specific task"""
        print("\n[5] Testing Get Task...")
        if not self.task_id:
            print("No task_id available, skipping...")
            return False
        response = requests.get(
            f"{API_URL}/tasks/{self.task_id}",
            headers=self.get_headers()
        )
        self.print_response(response, "Get Task")
        return response.status_code == 200

    def update_task(self):
        """Test updating a task"""
        print("\n[6] Testing Update Task...")
        if not self.task_id:
            print("No task_id available, skipping...")
            return False
        data = {
            "title": "Updated Test Task",
            "status": "in_progress"
        }
        response = requests.put(
            f"{API_URL}/tasks/{self.task_id}",
            json=data,
            headers=self.get_headers()
        )
        self.print_response(response, "Update Task")
        return response.status_code == 200

    def delete_task(self):
        """Test deleting a task"""
        print("\n[7] Testing Delete Task...")
        if not self.task_id:
            print("No task_id available, skipping...")
            return False
        response = requests.delete(
            f"{API_URL}/tasks/{self.task_id}",
            headers=self.get_headers()
        )
        self.print_response(response, "Delete Task")
        return response.status_code == 200

    def run_all_tests(self):
        """Run all API tests"""
        print("\n" + "="*60)
        print("TODO API TEST SUITE")
        print("="*60)

        results = {
            "Register": self.register(),
            "Login": self.login(),
            "Create Task": self.create_task(),
            "List Tasks": self.list_tasks(),
            "Get Task": self.get_task(),
            "Update Task": self.update_task(),
            "Delete Task": self.delete_task()
        }

        print("\n" + "="*60)
        print("TEST RESULTS SUMMARY")
        print("="*60)
        for test, passed in results.items():
            status = "✅ PASS" if passed else "❌ FAIL"
            print(f"{status}: {test}")

        total = len(results)
        passed = sum(1 for p in results.values() if p)
        print(f"\nTotal: {passed}/{total} tests passed")
        print("="*60)


def main():
    """Main test runner"""
    tester = TestAPI()

    try:
        tester.run_all_tests()
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to API server!")
        print("Make sure the server is running on http://localhost:8000")
        print("Start it with: uvicorn main:app --reload")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")


if __name__ == "__main__":
    main()
