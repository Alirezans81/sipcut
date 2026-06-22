# SipCut API Design

Base URL

```text
/api/v1/
```

---

# Authentication

## Send OTP

POST

```text
/auth/send-otp/
```

Request:

```json
{
  "phone_number": "+989xxxxxxxxx"
}
```

---

## Verify OTP & Register

POST

```text
/auth/register/
```

Request:

```json
{
  "phone_number": "+989xxxxxxxxx",
  "otp_code": "123456"
}
```

---

## Verify OTP & Login

POST

```text
/auth/login/
```

Request:

```json
{
  "phone_number": "+989xxxxxxxxx",
  "otp_code": "123456"
}
```

---

## Current User

GET

```text
/auth/me/
```

---

# Projects

## Create Project

POST

```text
/projects/
```

---

## List Projects

GET

```text
/projects/
```

---

## Retrieve Project

GET

```text
/projects/{id}/
```

---

## Delete Project

DELETE

```text
/projects/{id}/
```

---

# Scripts

## Generate Script

POST

```text
/projects/{id}/script/generate/
```

Request:

```json
{
  "prompt": ""
}
```

---

## Get Script

GET

```text
/projects/{id}/script/
```

---

# Upload

## Upload Clip

POST

```text
/projects/{id}/videos/
```

multipart/form-data

---

## Reorder Clips

POST

```text
/projects/{id}/videos/reorder/
```

---

# Processing

## Start Processing

POST

```text
/projects/{id}/process/
```

Enqueues the async pipeline (merge clips → generate transcript). Moves the
project to `PROCESSING` and returns `202` with the current processing state.

---

## Processing Status

GET

```text
/projects/{id}/processing/
```

Polled by the processing screen. Returns the project status plus the timeline
once it is ready:

```json
{
  "status": "READY_FOR_EDITING",
  "timeline": {
    "duration": 12.5,
    "source_video": { "url": "", "duration": 12.5 },
    "segments": [
      {
        "id": "",
        "text": "",
        "start_time": 0.0,
        "end_time": 3.0,
        "deleted": false,
        "order": 0
      }
    ]
  }
}
```

---

# Transcript

## Get Transcript

GET

```text
/projects/{id}/transcript/
```

---

## Update Transcript

PATCH

```text
/projects/{id}/transcript/
```

---

# Cleanup

## Remove Silence

POST

```text
/projects/{id}/cleanup/silence/
```

---

## Remove Breaths

POST

```text
/projects/{id}/cleanup/breaths/
```

---

# Color Correction

## Get Current Profile

GET

```text
/projects/{id}/color/
```

---

## Update Manual Adjustments

PATCH

```text
/projects/{id}/color/
```

Request:

```json
{
  "exposure": 0,
  "contrast": 0,
  "highlights": 0,
  "shadows": 0,
  "temperature": 0,
  "saturation": 0
}
```

---

## Apply Preset

POST

```text
/projects/{id}/color/preset/
```

Request:

```json
{
  "preset": "natural"
}
```

---

## AI Suggestion

POST

```text
/projects/{id}/color/suggest/
```

---

# Music

## List Built-in Tracks

GET

```text
/music/library/
```

---

## Upload Music

POST

```text
/projects/{id}/music/upload/
```

multipart/form-data

---

## Set Music Track

POST

```text
/projects/{id}/music/select/
```

Request:

```json
{
  "track_id": "",
  "source": "library"
}
```

---

## Update Music Settings

PATCH

```text
/projects/{id}/music/
```

Request:

```json
{
  "start_time": 0,
  "end_time": 0,
  "volume": 0.25,
  "fade_in": 0.5,
  "fade_out": 0.5
}
```

---

## AI Music Suggestion

POST

```text
/projects/{id}/music/suggest/
```

---

# Subtitles

## Generate

POST

```text
/projects/{id}/subtitles/generate/
```

Request:

```json
{
  "preset": "reels"
}
```

---

# Export

## Start Export

POST

```text
/projects/{id}/export/
```

---

## Export Status

GET

```text
/projects/{id}/export/status/
```

---

## Download Export

GET

```text
/projects/{id}/export/download/
```
