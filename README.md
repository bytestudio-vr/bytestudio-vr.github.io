# GNOME Remote Desktop Client for Meta Quest 3

A remote desktop client for Meta Quest 3 that connects to Ubuntu PCs running GNOME Remote Desktop (RDP protocol with H.264 video codec).

## Features

- **1920×1080 desktop** on a 2-meter floating panel with H.264 HW acceleration
- **Passthrough enabled** — see your hands and keyboard in the room
- **Qualcomm hardware H.264 decoding** for smooth, efficient video
- **Pointer stabilization** for comfortable pointing with hand and controllers
- **Dual-hand control** with conflict resolution
- **Bluetooth keyboard support** for physical keyboards
- **Virtual keyboard** with accents and touch input
- **Audio playback** (PCM, 300ms buffer)
- **Draggable & resizable panels** for flexible workspace layout
- **Server certificate pinning** (TOFU, like SSH) for security

## Requirements

- **Meta Quest 3** with Developer Mode enabled
- **Ubuntu PC with GNOME** (tested: Ubuntu 26.04)
- **GNOME Remote Desktop enabled** (RDP server running)
- **Local network connection** (Ethernet + Wi-Fi 5/6 GHz recommended for best latency)

## Known Limitations

- **GNOME desktop only** — not compatible with KDE, XFCE, or other desktop environments
- **Single display support** — only the primary monitor is shared
- **30 fps max** — server-side limit (GNOME Remote Desktop)
- **No clipboard, microphone, or file sharing**
- **No auto-reconnect** on network failure
- **Physical keyboard** not yet fully tested on real hardware

## Getting Started

1. Enable GNOME Remote Desktop on your Ubuntu PC
2. Install the app on Meta Quest 3 (Developer Mode required)
3. Enter your PC's IP, username, and password in the app
4. Connect and start working in VR!
