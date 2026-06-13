# SipCut MVP Architecture

## Overview

SipCut is a web-based AI-powered video editing platform.

The architecture is designed around the following principles:

* Backend-first architecture
* Asynchronous video processing
* Non-destructive editing
* Scalable storage
* AI provider abstraction
* Mobile-friendly experience
* Text-based editing as the primary workflow

The system must prioritize simplicity and maintainability over feature richness.

---

# High Level Architecture

```text
┌─────────────────────┐
│      Next.js        │
│      Frontend       │
└──────────┬──────────┘
           │
           │ HTTPS
           ▼
┌─────────────────────┐
│    Django + DRF     │
│       API Layer     │
└──────────┬──────────┘
           │
           ├──────────────┐
           │              │
           ▼              ▼

┌─────────────────┐   ┌─────────────────┐
│   PostgreSQL    │   │   S3 Storage    │
└─────────────────┘   └─────────────────┘

           │
           ▼

┌─────────────────────┐
│      Celery         │
│ Background Workers  │
└──────────┬──────────┘
           │
           ▼

┌─────────────────────┐
│       Redis         │
│   Task Queue        │
└─────────────────────┘

           │
           ▼

┌─────────────────────┐
│      FFmpeg         │
│ Video Processing    │
└─────────────────────┘

           │
           ▼

┌─────────────────────┐
│      GapGPT         │
│ AI Services         │
└─────────────────────┘
```

---

# System Components

## Frontend

Technology:

* Next.js
* TypeScript
* Tailwind CSS
* ShadCN UI

Responsibilities:

* User Interface
* Authentication UI
* Dashboard
* Script Assistant UI
* Upload UI
* Transcript Editor
* Timeline UI
* Subtitle UI
* Export UI

The frontend must not contain business logic.

The frontend should only:

* Display data
* Send commands
* Show processing status

All important logic belongs to backend services.

---

# Backend

Technology:

* Django
* Django REST Framework

Responsibilities:

* Authentication
* Authorization
* Project Management
* AI Integration
* Transcript Management
* Export Management
* File Management
* Processing Orchestration

Suggested Structure:

```text
backend/

apps/
├── accounts/
├── projects/
├── scripts/
├── videos/
├── transcripts/
├── subtitles/
├── exports/
├── ai/
└── common/
```

---

# Database Layer

Technology:

* PostgreSQL

Stores:

* Users
* Projects
* Scripts
* Video Metadata
* Transcript Metadata
* Export Metadata
* Cleanup Operations

Database should never store video files.

Only metadata should be stored.

---

# File Storage Layer

Technology:

* S3 Compatible Object Storage

Examples:

* MinIO
* Cloudflare R2
* AWS S3

Stores:

```text
Original Clips
Merged Videos
Subtitle Files
Rendered Videos
Temporary Files
```

Recommended Structure:

```text
uploads/

├── users/
│
├── projects/
│   ├── clips/
│   ├── merged/
│   ├── subtitles/
│   └── exports/
```

---

# Background Processing

Technology:

* Celery
* Redis

Purpose:

Prevent long-running video operations from blocking HTTP requests.

---

## Background Tasks

### Merge Clips

Input:

```text
Clip 1
Clip 2
Clip 3
```

Output:

```text
Merged Source Video
```

---

### Generate Transcript

Input:

```text
Source Video
```

Output:

```text
Transcript Segments
```

---

### Remove Silence

Input:

```text
Source Video
```

Output:

```text
Edit Instructions
```

---

### Remove Breaths

Input:

```text
Source Video
```

Output:

```text
Edit Instructions
```

---

### Generate Export

Input:

```text
Video
+
Edit Instructions
+
Subtitles
```

Output:

```text
Final MP4
```

---

# AI Layer

Provider:

* GapGPT

The application must never depend directly on GapGPT.

Use a provider abstraction.

Example:

```python
class AIProvider:

    def generate_script(self):
        pass

    def generate_transcript(self):
        pass
```

Current Implementation:

```python
GapGPTProvider(AIProvider)
```

Future Providers:

```python
OpenAIProvider(AIProvider)

AnthropicProvider(AIProvider)

GeminiProvider(AIProvider)
```

Switching providers should not require application-wide changes.

---

# Video Processing Layer

Technology:

* FFmpeg

All video manipulation must be performed through FFmpeg.

---

## Responsibilities

### Merge Clips

```text
Clip 1
+
Clip 2
+
Clip 3
```

↓

```text
Source Video
```

---

### Apply Transcript Cuts

Input:

```text
Deleted Transcript Segments
```

↓

```text
Cut Instructions
```

↓

```text
Video Cuts
```

---

### Apply Cleanup

Input:

```text
Silence Regions
Breath Regions
```

↓

```text
Cut Instructions
```

---

### Burn Subtitles

Input:

```text
Video
+
Subtitle File
```

↓

```text
Video With Subtitles
```

---

### Render Final Video

Input:

```text
Video
+
Cuts
+
Subtitles
```

↓

```text
Exported MP4
```

---

# Transcript-Centric Architecture

The transcript is the source of truth.

Example:

```json
{
  "text": "سلام دوستان",
  "start": 0.2,
  "end": 1.8,
  "deleted": false
}
```

Users never edit video directly.

Users edit transcript.

Transcript edits generate edit instructions.

Edit instructions generate video cuts.

---

# Non-Destructive Editing

Original uploaded files must never be modified.

Workflow:

```text
Original Clips
↓
Merged Source Video
↓
Transcript Edits
↓
Edit Instructions
↓
Render
↓
Final Export
```

Benefits:

* Undo
* Re-edit
* Multiple exports
* No quality loss

---

# Project Lifecycle

```text
Create Project
↓
Upload Clips
↓
Merge Clips
↓
Generate Transcript
↓
Ready For Editing
↓
Apply Cleanup
↓
Generate Subtitles
↓
Export
↓
Download
```

---

# State Machine

```text
DRAFT
↓
UPLOADING
↓
PROCESSING
↓
READY_FOR_EDITING
↓
EXPORTING
↓
COMPLETED
```

Failure States:

```text
FAILED_UPLOAD

FAILED_TRANSCRIPT

FAILED_EXPORT
```

Every state transition must be tracked in backend.

Frontend should always display current status.

---

# Security

Authentication:

* JWT Authentication

Passwords:

* Hashed using Django's built-in password hashing

Protected Resources:

* Projects
* Videos
* Exports
* Transcripts

Users must only access their own resources.

---

# Scalability Considerations

The architecture should support future additions without major rewrites.

Future Features:

* Music Library
* Cover Generator
* Team Workspaces
* Analytics
* AI B-Roll
* AI Voice Tools
* Mobile Apps

The MVP architecture should be built so these features can be added later without redesigning core systems.

---

# Development Principles

1. Keep business logic in Django.
2. Keep frontend thin.
3. Use Celery for all heavy tasks.
4. Store videos in object storage.
5. Never edit original files.
6. Use transcript as the source of truth.
7. Prioritize simplicity over flexibility.
8. Optimize for creator speed, not editor power.

---

# Definition of Success

A creator should be able to:

```text
Idea
↓
Script
↓
Upload
↓
Edit By Text
↓
Subtitle
↓
Export
```

in less than 10 minutes.

If the user feels they need to learn video editing, the architecture is supporting the wrong product.
