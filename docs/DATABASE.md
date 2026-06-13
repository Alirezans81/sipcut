# SipCut Database Design

## User

```python
id
email
password
created_at
updated_at
```

---

## Project

```python
id
user_id
title
status
created_at
updated_at
```

Relationship:

```text
User
  └── Projects
```

---

## Script

```python
id
project_id
title
hook
script
shot_list
cta
created_at
```

---

## Video

```python
id
project_id
path
duration
order
created_at
```

Represents uploaded clips.

---

## SourceVideo

```python
id
project_id
path
duration
created_at
```

Represents merged video.

---

## Transcript

```python
id
project_id
created_at
```

---

## TranscriptSegment

```python
id
transcript_id
text
start_time
end_time
deleted
order
```

---

## CleanupOperation

```python
id
project_id
type
start_time
end_time
created_at
```

Types:

* silence
* breath

---

## ColorProfile

```python
id
project_id
preset
exposure
contrast
highlights
shadows
temperature
saturation
source
updated_at
```

Source:

* manual
* preset
* ai_suggested

---

## MusicTrack

```python
id
title
artist
license_type
is_royalty_free
duration
path
created_at
```

Represents built-in royalty-free tracks.

---

## ProjectMusic

```python
id
project_id
music_track_id
uploaded_path
source
start_time
end_time
volume
fade_in
fade_out
updated_at
```

Source:

* library
* uploaded
* ai_suggested

---

## Subtitle

```python
id
project_id
preset
path
created_at
```

---

## Export

```python
id
project_id
status
path
created_at
```
