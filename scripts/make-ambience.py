"""Original synthesized ambient bed; no samples or third-party music."""
import math
import struct
import wave
from pathlib import Path

rate = 22050
seconds = 24
# Midrange fundamentals remain audible on a phone speaker. No sharp attacks.
chords = [(261.6256, 329.6276, 391.9954), (220.0, 261.6256, 329.6276),
          (349.2284, 440.0, 523.2512), (293.6648, 391.9954, 523.2512)]
frames = bytearray()
for i in range(rate * seconds):
    t = i / rate
    section = min(3, int(t / 6))
    local = t - section * 6
    # Short attack/release instead of several seconds near silence per chord.
    envelope = min(1.0, local / 0.35, (6 - local) / 0.6)
    sound = sum(math.sin(2 * math.pi * f * t) + 0.12 * math.sin(2 * math.pi * f * 2 * t) for f in chords[section]) / 3
    sample = int(32767 * 0.6 * envelope * sound)
    frames.extend(struct.pack('<h', sample))
path = Path(__file__).resolve().parents[1] / 'assets' / 'tilleuls-ambience.wav'
with wave.open(str(path), 'wb') as out:
    out.setnchannels(1)
    out.setsampwidth(2)
    out.setframerate(rate)
    out.writeframes(frames)
print(path.name, len(frames), 'bytes PCM')
