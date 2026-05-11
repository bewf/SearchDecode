# Search Decode

Simple extension that instantly decodes Base64 searches.


## Modes

### URL ONLY
Only decodes when the output looks like a valid link

### URL + TEXT
Decodes links and normal text.

## Example



**Input:**

```aHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS8=```



**Output:**

```https://www.google.com/```

## Behavior
This will only redirect if the decoded output is a valid HTTP or HTTPS link.

