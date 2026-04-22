import subprocess
import sys
import os

# Set environment variable to handle protobuf version conflict
os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"

# Using the revival conda environment which has a working torch+cuda and whisperx
python_exe = r"C:\Users\umair\miniconda3\envs\revival\python.exe"
video_path = "Screen Recording 2026-04-22 010233.mp4"

if not os.path.isfile(video_path):
    print(f"Video file not found at {os.path.abspath(video_path)}!")
    sys.exit(1)

command = [
    python_exe,
    "-m", "whisperx",
    video_path,
    "--device", "cpu",
    "--compute_type", "int8",
    "--model", "medium",
    "--language", "en",
    "--vad_method", "silero"
]

print("Transcribing video (CPU processing + Silero VAD)...")
subprocess.run(command)

print("\nDone!")
print("Subtitles saved in the same folder as the video.")
