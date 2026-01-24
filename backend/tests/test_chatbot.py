"""
Test script for Chatbot API
Run with: python tests/test_chatbot.py
"""

import requests
import json
from typing import Optional

BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api"


class TestChatbot:
    def __init__(self):
        self.token: Optional[str] = None
        self.user_id: Optional[str] = None
        self.conversation_id: Optional[str] = None

    def print_response(self, response, title):
        """Pretty print API response"""
        print(f"\n{'='*60}")
        print(f"{title}")
        print(f"{'='*60}")
        print(f"Status Code: {response.status_code}")
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            # Show the assistant's response
            if "response" in data:
                print(f"\n🤖 Assistant: {data['response']}")
        except:
            print(f"Response: {response.text}")

    def get_headers(self):
        """Get headers with auth token"""
        return {"Authorization": f"Bearer {self.token}"}

    def setup(self):
        """Register and login to get credentials"""
        print("\n[Setup] Creating test user...")

        # Try to register
        register_data = {
            "email": "chatbot@example.com",
            "password": "test12345",
            "name": "Chatbot Test User"
        }
        response = requests.post(f"{API_URL}/auth/register", json=register_data)

        # Login regardless (user might already exist)
        login_data = {
            "email": "chatbot@example.com",
            "password": "test12345"
        }
        response = requests.post(f"{API_URL}/auth/login", json=login_data)

        if response.status_code == 200:
            self.token = response.json()["access_token"]
            self.user_id = response.json()["user"]["id"]
            print(f"✅ Logged in as user: {self.user_id}")
            return True
        return False

    def test_add_task(self):
        """Test: Add a task via chatbot"""
        print("\n[Test 1] Add task via chatbot")
        data = {
            "message": "Add a task: Pay electricity bill"
        }
        response = requests.post(
            f"{API_URL}/{self.user_id}/chat",
            json=data,
            headers=self.get_headers()
        )
        self.print_response(response, "Add Task via Chatbot")

        if response.status_code == 200:
            self.conversation_id = response.json().get("conversation_id")
            return "added" in response.json().get("response", "").lower()
        return False

    def test_list_tasks(self):
        """Test: List tasks via chatbot"""
        print("\n[Test 2] List tasks via chatbot")
        data = {
            "message": "List all my tasks",
            "conversation_id": self.conversation_id
        }
        response = requests.post(
            f"{API_URL}/{self.user_id}/chat",
            json=data,
            headers=self.get_headers()
        )
        self.print_response(response, "List Tasks via Chatbot")

        if response.status_code == 200:
            resp_text = response.json().get("response", "").lower()
            return "task" in resp_text or "no tasks" in resp_text
        return False

    def test_complete_task(self):
        """Test: Complete a task via chatbot"""
        print("\n[Test 3] Complete task via chatbot")
        data = {
            "message": "Complete task 1",
            "conversation_id": self.conversation_id
        }
        response = requests.post(
            f"{API_URL}/{self.user_id}/chat",
            json=data,
            headers=self.get_headers()
        )
        self.print_response(response, "Complete Task via Chatbot")

        if response.status_code == 200:
            resp_text = response.json().get("response", "").lower()
            return "complete" in resp_text or "done" in resp_text
        return False

    def test_update_task(self):
        """Test: Update a task via chatbot"""
        print("\n[Test 4] Update task via chatbot")
        data = {
            "message": "Update task 1 title to Updated Test Task",
            "conversation_id": self.conversation_id
        }
        response = requests.post(
            f"{API_URL}/{self.user_id}/chat",
            json=data,
            headers=self.get_headers()
        )
        self.print_response(response, "Update Task via Chatbot")

        if response.status_code == 200:
            resp_text = response.json().get("response", "").lower()
            return "update" in resp_text or "change" in resp_text
        return False

    def test_delete_task(self):
        """Test: Delete a task via chatbot"""
        print("\n[Test 5] Delete task via chatbot")
        data = {
            "message": "Delete task 1 now",
            "conversation_id": self.conversation_id
        }
        response = requests.post(
            f"{API_URL}/{self.user_id}/chat",
            json=data,
            headers=self.get_headers()
        )
        self.print_response(response, "Delete Task via Chatbot")

        if response.status_code == 200:
            resp_text = response.json().get("response", "").lower()
            return "delete" in resp_text or "remove" in resp_text
        return False

    def run_all_tests(self):
        """Run all chatbot tests"""
        print("\n" + "="*60)
        print("CHATBOT API TEST SUITE")
        print("="*60)

        if not self.setup():
            print("❌ Failed to setup user")
            return

        results = {
            "Add Task": self.test_add_task(),
            "List Tasks": self.test_list_tasks(),
            "Complete Task": self.test_complete_task(),
            "Update Task": self.test_update_task(),
            "Delete Task": self.test_delete_task()
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
    tester = TestChatbot()

    try:
        tester.run_all_tests()
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to API server!")
        print("Make sure the server is running on http://localhost:8000")
        print("Start it with: uvicorn main:app --reload")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
