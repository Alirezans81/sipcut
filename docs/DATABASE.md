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
