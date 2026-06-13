# SipCut API Design

Base URL

```text
/api/v1/
```

---

# Authentication

## Register

POST

```text
/auth/register/
```

Request:

```json
{
  "email": "",
  "password": ""
}
```

---

## Login

POST

```text
/auth/login/
```

Request:

```json
{
  "email": "",
  "password": ""
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
