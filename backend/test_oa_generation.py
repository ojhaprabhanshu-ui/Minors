"""
Test script for OA question generation with improved error handling
"""
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from oa.gemini_generator import generate_dsa_questions

def test_oa_generation():
    """Test the OA question generation with proper error handling"""
    print("Testing OA Question Generation with Enhanced Error Handling")
    print("=" * 60)
    
    # Test 1: Check if API key is configured
    print("\nTest 1: Checking API configuration...")
    import os
    api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("GEMINI_API_KEY")
    if api_key:
        print(f"[OK] API key is configured (first 8 chars: {api_key[:8]}...)")
    else:
        print("[FAIL] No API key configured")
        print("Expected behavior: Should raise ValueError with clear message")
    
    # Test 2: Test with candidate profile
    print("\nTest 2: Testing question generation with candidate profile...")
    candidate_profile = {
        "skills": ["Python", "JavaScript", "React"],
        "experience_years": 3,
        "_skill_block": "The candidate has strong experience in web development with React and Node.js, and is proficient in Python for backend services."
    }
    
    try:
        questions = generate_dsa_questions(candidate_profile, max_retries=2)
        print(f"[OK] Successfully generated {len(questions)} questions")
        
        for i, q in enumerate(questions, 1):
            print(f"\nQuestion {i}:")
            print(f"  Title: {q['title']}")
            print(f"  Topic: {q['topic']}")
            print(f"  Difficulty: {q['difficulty']}")
            print(f"  Function: {q['functionName']}")
        
        print("\n[OK] All tests passed!")
        return True
        
    except ValueError as e:
        print(f"[FAIL] ValueError (API configuration): {str(e)}")
        print("This is expected if no API key is configured")
        return False
        
    except RuntimeError as e:
        print(f"[FAIL] RuntimeError (AI generation failed): {str(e)}")
        print("This could be due to network issues or AI service unavailability")
        return False
        
    except Exception as e:
        print(f"[FAIL] Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_oa_generation()
    sys.exit(0 if success else 1)