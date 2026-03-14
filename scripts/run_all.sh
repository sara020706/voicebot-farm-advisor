#!/bin/bash
bash "$(dirname "$0")/run_backend.sh" &
bash "$(dirname "$0")/run_frontend.sh"
