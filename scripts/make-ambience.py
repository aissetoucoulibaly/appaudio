"""Original synthesized ambient bed; no samples or third-party music."""
import math
import struct
import wave
from pathlib import Path

rate = 22050
seconds = 24
# Slowly alternating consonant chords, low amplitude, no drums or sharp attacks.
chords = [(130.8128, 164.8138, 195.9977), (110.0, 130.8128, 164.8138),
          (87.3071, 110.0, 130.8128), (97.9989, 130.8128, 146.8324)]
frames = bytearray()
for i in range(rate * seconds):
    t = i / rate
    section = min(3, int(t / 6))
    local = t - section * 6
    envelope = math.sin(math.pi * local / 6) ** 2
    sound = sum(math.sin(2 * math.pi * f * t) + 0.12 * math.sin(2 * math.pi * f * 2 * t) for f in chords[section]) / 3
    sample = int(32767 * 0.32 * envelope * sound)
    frames.extend(struct.pack('<h', sample))
path = Path(__file__).resolve().parents[1] / 'assets' / 'tilleuls-ambience.wav'
with wave.open(str(path), 'wb') as out:
    out.setnchannels(1)
    out.setsampwidth(2)
    out.setframerate(rate)
    out.writeframes(frames)
print(path.name, len(frames), 'bytes PCM')
