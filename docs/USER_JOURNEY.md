# SipCut MVP User Journey

## Overview

This document describes the complete user journey for the SipCut MVP.

The goal is to help Instagram creators go from idea to published reel as quickly as possible.

Core workflow:

```text
Dashboard
↓
Create Project
↓
Generate Script (Optional)
↓
Upload / Record Clips
↓
Arrange Clips
↓
Processing
↓
Edit By Text
↓
Auto Cleanup
↓
Light & Color
↓
Music
↓
Generate Subtitles
↓
Export
↓
Download
```

The entire flow must be usable on both desktop and mobile browsers.

---

# Primary User Persona

Instagram Creator

Characteristics:

* Creates short-form content
* Records videos using a smartphone
* Does not enjoy video editing
* Wants fast publishing
* Prefers simplicity over flexibility
* Usually edits simple talking-head videos
* Wants AI assistance instead of learning editing software

---

# Core Product Principle

Users should never feel like they are using a professional video editor.

The experience should feel like:

```text
ChatGPT
+
Descript
+
One Click Reel Export
```

instead of:

```text
CapCut
```

Transcript editing is the primary editing method.

Timeline editing is secondary.

---

# Responsive Experience

SipCut is a web application.

The application must provide a great experience on:

* Mobile browsers
* Tablets
* Desktop browsers

Supported minimum width:

```text
360px
```

Users should be able to complete the entire workflow from a mobile browser.

---

# Screen 1: Authentication

## Purpose

Allow users to access their projects.

## Method

Passwordless authentication via phone number + one-time password (OTP).

Login

```text
Phone Number
↓
Enter OTP
```

Register

```text
Phone Number
↓
Enter OTP
```

Both flows share a single "send OTP" step; register is for new numbers, login is
for already-verified ones.

## Success

Navigate to Dashboard.

---

# Screen 2: Dashboard

## Purpose

Manage projects.

## Layout

Desktop:

```text
Header
Project Grid
Create Project Button
```

Mobile:

```text
Header
Create Project Button
Project List
```

## Project Card

Each project displays:

* Project Name
* Creation Date
* Current Status

Example:

```text
Hair Salon Reel
READY_FOR_EDITING

Fitness Reel
PROCESSING

Marketing Tips
COMPLETED
```

## Available Actions

```text
Create New Project
Open Project
Delete Project
```

## Primary CTA

```text
+ Create Project
```

---

# Screen 3: Create Project

## Purpose

Create a new project.

## Fields

```text
Project Name
```

Example:

```text
5 Hair Styling Tips
```

## Actions

```text
Continue
```

## Success

Navigate to AI Script Assistant.

---

# Screen 4: AI Script Assistant

## Purpose

Help users generate content ideas before recording.

## Layout

Desktop:

```text
--------------------------------
Chat
--------------------------------

Generated Script Panel
--------------------------------
```

Mobile:

```text
Chat

Generated Script Panel
```

Stacked vertically.

---

## User Flow

User writes:

```text
I am a fitness coach and want a reel about fat loss.
```

AI generates:

```text
Title

Hook

Script

Shot List

CTA
```

---

## Available Actions

```text
Generate Script
Regenerate
Save Script
Copy Script
Skip
```

---

## Notes

This step is optional.

Users can skip directly to uploading videos.

---

# Screen 5: Upload Clips

## Purpose

Collect source footage.

## Upload Methods

### Upload Existing Videos

User selects videos from device.

### Record Video

User records directly from browser.

---

## Mobile Record Flow

User taps:

```text
Record Video
```

System:

```text
Request Camera Permission
↓
Open Camera
↓
Record Video
↓
Save Video
↓
Add To Upload Queue
```

The user should not need to leave SipCut to record content.

---

## Uploaded Clips List

Example:

```text
Hook.mp4
Part1.mp4
Part2.mp4
CTA.mp4
```

---

## Available Actions

```text
Rename Clip
Delete Clip
Reorder Clip
```

Users can drag and drop clips.

---

## Primary CTA

```text
Create Project
```

---

## Success

Backend starts processing.

---

# Screen 6: Processing

## Purpose

Prepare the project.

## Backend Tasks

```text
Upload Files
↓
Store Files
↓
Merge Clips
↓
Generate Transcript
↓
Create Timeline
↓
Generate AI Suggestions
↓
Ready For Editing
```

---

## Progress UI

Example:

```text
Uploading Files
100%

Merging Clips
100%

Generating Transcript
72%
```

---

## Success

Automatically navigate to Editor.

---

# Screen 7: Editor

## Purpose

Main editing experience.

This is the most important screen in SipCut.

---

## Desktop Layout

```text
--------------------------------
Video Preview
--------------------------------

Transcript Editor

--------------------------------

Timeline
--------------------------------
```

---

## Mobile Layout

```text
Video Preview

Transcript Editor

Timeline
```

Stacked vertically.

Timeline becomes horizontally scrollable.

---

# Video Preview Panel

## Purpose

Preview current result.

## Controls

```text
Play
Pause
Volume
Fullscreen
```

Video updates when transcript changes.

---

# Transcript Editor

## Purpose

Edit video by editing text.

Example:

```text
سلام دوستان

امروز میخوام درباره ...

این قسمت رو توضیح بدم
```

---

## Available Actions

```text
Select Text
Delete Text
Undo
Redo
```

---

## Editing Behavior

User deletes:

```text
Sentence B
```

System removes corresponding video segment.

No timeline editing required.

---

# Timeline

## Purpose

Visual feedback.

Timeline is not a professional editor.

---

## Features

```text
Playhead
Seek
Display Cuts
Display Subtitle Regions
Display Deleted Sections
```

---

## Not Supported

```text
Multi Track Editing
Effects
Transitions
Keyframes
Advanced Trimming
```

---

# Screen 8: AI Cleanup

## Purpose

Automatically improve talking-head videos.

---

## Options

```text
✓ Remove Silence

✓ Remove Long Breaths
```

---

## Actions

```text
Preview Changes
Apply Changes
Undo Changes
```

---

## Processing

System updates edit instructions.

Original video is never modified.

---

# Screen 9: Light & Color

## Purpose

Apply natural light and color correction quickly.

---

## Controls

```text
Exposure
Contrast
Highlights
Shadows
Temperature
Saturation
```

---

## Presets

```text
Natural
Warm
Cool
Bright
```

---

## AI Suggestion

System suggests one setup based on:

```text
Transcript Text
Speech Pace
Cut Rhythm
```

User can apply the suggestion with one tap.

---

# Screen 10: Music

## Purpose

Add background music before subtitle and export.

---

## Music Sources

```text
Built-in Royalty-Free Library
Upload My Music
```

---

## Controls

```text
Select Track
Trim Start
Trim End
Volume
Fade In
Fade Out
```

---

## AI Suggestion

System suggests one track based on:

```text
Transcript Text
Video Rhythm
Speaking Energy
```

User can replace or remove the suggestion anytime.

---

# Screen 11: Subtitle Generator

## Purpose

Generate Persian subtitles.

---

## Workflow

```text
Select Style
↓
Generate
↓
Preview
```

---

## Subtitle Presets

```text
Clean
Bold
Reels
```

---

## Preview

Subtitles appear directly on video preview.

Users can switch between presets instantly.

---

# Screen 12: Export

## Purpose

Generate final reel.

---

## Fixed Export Settings

```text
MP4
1080x1920
9:16
```

Users cannot modify export settings in MVP.

---

## Actions

```text
Export Video
```

---

## Success

Create render job.

---

# Screen 13: Export Progress

## Purpose

Display render status.

---

## UI Example

```text
Rendering Video

73%
```

---

## User Actions

```text
Close Page
Return To Dashboard
```

Rendering continues in background.

---

# Screen 14: Export Complete

## Purpose

Download final result.

---

## Display

```text
Export Duration
Video Duration
File Size
```

---

## Available Actions

```text
Download Video
Open Project
Create New Project
```

---

# Project Status Flow

Projects must always have a visible state.

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

---

# Empty States

## No Projects

```text
Create your first reel.
```

---

## No Clips

```text
Upload or record your first clip.
```

---

## No Transcript

```text
Transcript is being generated.
```

---

# Mobile Experience Requirements

A user must be able to:

* Register
* Login
* Create project
* Generate script
* Record video
* Upload clips
* Edit transcript
* Remove silence
* Apply light and color correction
* Add background music
* Generate subtitles
* Export reel
* Download final video

using only a mobile browser.

No desktop computer should be required.

---

# Success Criteria

A first-time user should be able to:

1. Create a project.
2. Generate a script.
3. Upload or record clips.
4. Edit video by deleting text.
5. Remove silence and long breaths.
6. Apply light and color correction.
7. Add background music.
8. Generate subtitles.
9. Export a reel.

Target completion time:

Less than 10 minutes.

If users need to learn video editing concepts to use SipCut, the user journey has failed.
