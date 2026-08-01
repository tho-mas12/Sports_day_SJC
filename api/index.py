import sys
import os
from pathlib import Path

# Append parent and backend folders to system path for correct Vercel imports
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.append(str(backend_dir))
sys.path.append(str(backend_dir.parent))

from main import app
