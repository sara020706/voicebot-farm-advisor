#!/bin/bash
cd "$(dirname "$0")/../backend"
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
