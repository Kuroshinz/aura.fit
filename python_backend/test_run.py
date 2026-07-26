import sys
import os
import asyncio

# Change working dir to python_backend
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from main import main

if __name__ == "__main__":
    print("Testing main()...")
    try:
        asyncio.run(main())
    except Exception as e:
        print("EXCEPTION IN MAIN:", e)
