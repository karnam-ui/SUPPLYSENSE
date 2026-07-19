#!/usr/bin/env python3
"""Test script to verify Ollama integration."""
import sys
sys.path.insert(0, '/Users/sainishanth/SUPPLYSENSE/backend')

from ai_utils import check_ollama_available, query_ollama
from config import OLLAMA_BASE_URL, OLLAMA_MODEL

print(f"🔍 Testing Ollama Integration")
print(f"   Base URL: {OLLAMA_BASE_URL}")
print(f"   Model: {OLLAMA_MODEL}")
print()

# Test 1: Check if Ollama is available
print("1️⃣  Checking if Ollama is running...")
if check_ollama_available():
    print("   ✅ Ollama is available!")
else:
    print("   ❌ Ollama is not available. Make sure 'ollama serve' is running.")
    sys.exit(1)

print()

# Test 2: Query Ollama
print("2️⃣  Testing AI query...")
test_question = "What are the top 3 supply chain risks I should monitor?"
print(f"   Question: {test_question}")
print()
print("   Getting response from Ollama...")

response = query_ollama(test_question)
if response:
    print(f"   ✅ Response received:")
    print()
    for line in response.split('\n'):
        if line.strip():
            print(f"      {line}")
else:
    print("   ❌ Failed to get response from Ollama.")
    sys.exit(1)

print()
print("✨ Ollama integration is working perfectly!")
