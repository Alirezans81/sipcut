# SipCut MVP Specification

## Overview

SipCut is an AI-powered video editing platform designed for Instagram creators.

The purpose of SipCut is not to compete with professional video editors such as CapCut, Premiere Pro, or Final Cut Pro.

The purpose of SipCut is to help creators go from idea to published reel as quickly as possible.

Core workflow:

```text
Idea
↓
Script
↓
Record
↓
Upload
↓
Edit By Text
↓
Subtitle
↓
Export
```

Target users:

* Instagram creators
* Solo content creators
* Influencers
* Coaches
* Small business owners producing content
* Users who do not want to learn professional video editing

Non-goals:

* Professional video editing
* Multi-track editing
* Motion graphics
* Advanced effects
* Advanced transitions
* Professional color grading
* Professional audio editing
* Team collaboration

---

# Product Philosophy

SipCut is not a video editor.

SipCut is a content publishing tool.

The user should never feel like they are using CapCut.

The experience should feel closer to:

```text
ChatGPT
+
Descript
+
One Click Reel Export
```

instead of:

```text
Professional Video Editing Software
```

Every new feature must answer:

> Does this help creators publish faster?

If the answer is no, it should not be included in the MVP.

---

# MVP Scope

The MVP consists of five major modules:

1. AI Script Assistant
2. Video Upload & Processing
3. Text-Based Editing
4. Subtitle Generator
5. Export System

---

# Module 1: AI Script Assistant

## Goal

Help creators generate content ideas and scripts before recording.

## Interface

Chat-based interface.

Users communicate with AI and receive structured content.

Example:

User:

```text
I'm a fitness coach and want to make a reel about fat loss.
```

AI Response:

```json
{
  "title": "",
  "hook": "",
  "script": "",
  "shotList": [],
  "cta": ""
}
```

## Required Output Structure

Every generated script must include:

* Title
* Hook
* Main Script
* Shot List
* CTA

Example:

```json
{
  "title": "3 Fat Loss Mistakes",
  "hook": "If you're doing these 3 things, you're slowing your fat loss.",
  "script": "...",
  "shotList": [
    "...",
    "...",
    "..."
  ],
  "cta": "Follow for more tips."
}
```

## AI Provider

Current Provider:

* GapGPT

The implementation must use an abstraction layer.

Future providers should be replaceable without changing application logic.

Example:

```python
class AIProvider:
    def generate_script():
        pass
```

---

# Module 2: Video Upload

## Goal

Allow users to upload content clips.

## Upload Methods

### Method 1

Upload existing videos.

### Method 2

Record video using browser camera.

Recorded videos should automatically be added to the upload list.

---

## Multiple Clips

Users can upload multiple clips.

Example:

```text
Hook.mp4
Part1.mp4
Part2.mp4
CTA.mp4
```

Before project creation:

* Rename clips
* Delete clips
* Reorder clips

---

## Video Merge

After upload:

All clips must be merged into a single source video.

Example:

```text
Clip 1
Clip 2
Clip 3
↓
Merge
↓
Source Video
```

After merge:

The project behaves as a single video project.

The application should not manage clips individually after merging.

---

# Module 3: Text-Based Editing

## Goal

Allow creators to edit videos by editing text.

This is the core feature of SipCut.

---

## Transcript Generation

After video processing:

Generate transcript using GapGPT Speech-To-Text.

Example:

```json
[
  {
    "text": "سلام دوستان",
    "start": 0.0,
    "end": 1.5,
    "deleted": false
  },
  {
    "text": "امروز میخوام",
    "start": 1.5,
    "end": 3.0,
    "deleted": false
  }
]
```

---

## Transcript Editor

Display transcript in editable format.

Example:

```text
سلام دوستان

امروز میخوام درباره ...

این قسمت رو توضیح بدم
```

Users can:

* Select text
* Delete text
* Undo changes

---

## Editing Logic

Example:

```text
Sentence A
Sentence B
Sentence C
```

User removes:

```text
Sentence B
```

Result:

The corresponding video segment is removed.

---

## Non-Destructive Editing

Original files must never be modified.

Store:

* Original clips
* Merged source video
* Edit instructions

Final videos are generated during export.

This enables:

* Undo
* Re-edit
* Re-export

without quality loss.

---

## Timeline

A simple timeline must exist.

Purpose:

Visual feedback.

Supported features:

* Play
* Pause
* Seek
* Show cuts
* Show subtitle regions

Not supported:

* Multi-track editing
* Dragging clips
* Advanced trimming
* Keyframes
* Effects

Timeline is secondary.

Transcript editing is primary.

---

# Module 4: Auto Cleanup

## Goal

Improve talking-head videos automatically.

---

## Available Actions

### Remove Silence

Detect silent segments.

Remove them automatically.

### Remove Long Breaths

Detect obvious breathing sounds.

Remove them automatically.

---

## User Actions

Users can:

* Preview changes
* Apply changes
* Undo changes

---

## Not Included In MVP

* Filler word removal
* Stutter removal
* AI speech rewriting
* Voice enhancement

---

# Module 5: Subtitle Generator

## Goal

Automatically generate Persian subtitles.

---

## Language Support

MVP only supports:

* Persian

---

## Subtitle Source

Subtitles are generated from transcript data.

---

## Presets

Available presets:

* Clean
* Bold
* Reels

Preset controls:

* Font size
* Position
* Basic animation style

Users can switch between presets.

Custom subtitle editing is not required for MVP.

---

# Export System

## Goal

Generate Instagram-ready reels.

---

## Output Format

Only one export format is supported:

```text
1080x1920
9:16
MP4
```

---

## Export Pipeline

```text
Source Video
+
Edit Instructions
+
Subtitles
↓
Render
↓
MP4
```

---

## Rendering

Rendering must happen on backend.

Frontend only shows progress.

---

# Responsive Design Requirements

The application must be fully responsive.

Supported devices:

* Mobile Browser
* Tablet
* Desktop

Supported widths:

* 360px+
* Tablet
* Desktop

Users must be able to complete the full workflow from mobile devices.

Required mobile capabilities:

* Generate scripts
* Record videos
* Upload clips
* Edit transcript
* Generate subtitles
* Export videos

without needing a desktop computer.

---

# Technical Architecture

## Frontend

Framework:

* Next.js
* TypeScript

Suggested Stack:

* Tailwind CSS
* ShadCN UI

Requirements:

* Responsive UI
* Dark Mode
* Accessible Components
* Fast Loading

---

## Backend

Framework:

* Django
* Django REST Framework (DRF)

Responsibilities:

* Authentication
* Project Management
* Video Upload Management
* AI Integrations
* Transcript Generation
* Subtitle Generation
* Rendering Orchestration
* Export Management

Suggested Structure:

```text
apps/
├── accounts/
├── projects/
├── videos/
├── transcripts/
├── exports/
├── ai/
└── common/
```

---

# Architecture Rules

## Backend First

All business logic must live in Django.

Frontend responsibilities:

* Display data
* Handle interactions
* Upload files
* Poll task status

Backend responsibilities:

* AI operations
* Video processing
* Rendering
* Business logic
* File management

Business logic must never be duplicated in frontend.

---

## Asynchronous Processing

Heavy operations must never run inside HTTP requests.

Use:

* Celery
* Redis

Background tasks:

* Video merging
* Transcript generation
* Subtitle generation
* Silence removal
* Breath removal
* Export rendering

---

## AI Provider Abstraction

Application must never depend directly on a single provider.

Create provider abstraction.

Example:

```python
class AIProvider:
    generate_script()
    generate_transcript()
```

Current provider:

* GapGPT

Future providers:

* OpenAI
* Anthropic
* Gemini

---

# Storage

Use S3-compatible object storage.

Store:

* Original clips
* Source videos
* Transcript files
* Subtitle files
* Exported videos
* Temporary render files

---

# Video Processing

Use FFmpeg.

Responsibilities:

* Clip merging
* Cut generation
* Silence removal
* Subtitle burn-in
* Export generation

---

# Project State Machine

Projects must have explicit states.

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

Error states:

```text
FAILED_UPLOAD
FAILED_TRANSCRIPT
FAILED_EXPORT
```

Frontend should always display current project state.

---

# Database Entities

## User

```json
{
  "id": "",
  "email": "",
  "createdAt": ""
}
```

## Project

```json
{
  "id": "",
  "userId": "",
  "title": "",
  "status": "",
  "createdAt": ""
}
```

## Video

```json
{
  "id": "",
  "projectId": "",
  "path": "",
  "duration": 0
}
```

## Transcript

```json
{
  "id": "",
  "projectId": "",
  "segments": []
}
```

## Export

```json
{
  "id": "",
  "projectId": "",
  "status": "",
  "outputUrl": ""
}
```

---

# Authentication

MVP Authentication:

* Email
* Password

Not required:

* OAuth
* Google Login
* Social Login

Keep authentication simple.

---

# Explicitly Out Of Scope

The following features must NOT be implemented in MVP:

* Music Library
* Cover Generator
* Thumbnail Generator
* AI Avatars
* AI Voice Cloning
* AI B-Roll Generation
* Stock Video Library
* Multi-Track Editing
* Advanced Effects
* Motion Graphics
* Collaboration
* Team Workspaces
* Organizations
* Roles & Permissions
* Social Media Publishing
* Analytics
* Mobile Applications

These features belong to future versions.

---

# Success Criteria

A first-time creator should be able to:

1. Create a project.
2. Generate a script.
3. Upload clips.
4. Merge clips.
5. Generate transcript.
6. Edit by deleting text.
7. Remove silence.
8. Remove long breaths.
9. Generate subtitles.
10. Export a reel.

Target completion time:

Less than 10 minutes.

If users need to learn video editing concepts to use SipCut, the MVP has failed.
