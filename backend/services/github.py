import re
import base64
import urllib.request
import urllib.error
import json
import os
from dotenv import load_dotenv

load_dotenv()

def _build_headers() -> dict:
    """Build GitHub API headers, including auth token if available."""
    headers = {"User-Agent": "CareerSim-AI"}
    token = os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"token {token}"
    return headers

INCLUDE_EXTENSIONS = {".py", ".ts", ".tsx", ".js", ".md", ".toml", ".txt", ".yaml", ".yml",}
INCLUDE_FILENAMES = {"Dockerfile", "main.py", "app.py", "server.py", "index.ts",
                     "README.md", "requirements.txt", "index.js"}
INCLUDE_PATHS = {"src/", "api/", "routes/", "routers/", "services/", "core/", "utils/",
                 "app/", "agents/", "models/", "lib/"}

EXCLUDE_DIRS = {"node_modules/", "venv/", ".venv/", "__pycache__/", ".git/",
                "tests/", "test/", "dist/", "build/", ".next/"}
EXCLUDE_FILES = {"package-lock.json", "poetry.lock", "yarn.lock"}
EXCLUDE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff",
                      ".woff2", ".ttf", ".eot", ".map", ".lock", ".env",
                      ".pyc", ".pyd", ".so", ".dll", ".exe"}

CHAR_BUDGET = 160_000


def _parse_github_url(url: str) -> tuple[str, str]:
    """Parse GitHub URL into (owner, repo). Raises ValueError on invalid input."""
    url = url.strip()
    # Strip trailing .git
    if url.endswith(".git"):
        url = url[:-4]
    # Add scheme if missing
    if not url.startswith("http"):
        url = "https://" + url
    # Match github.com/owner/repo
    m = re.search(r"github\.com/([^/]+)/([^/?\s]+)", url)
    if not m:
        raise ValueError(f"Could not parse GitHub URL: {url}")
    return m.group(1), m.group(2)


def _get(url: str) -> dict:
    """Make a GET request to the GitHub API and return parsed JSON."""
    print(f"  [GitHub] GET {url}")
    req = urllib.request.Request(url, headers=_build_headers())
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _should_include(path: str) -> bool:
    """Decide whether a file path should be included in the bundle."""
    filename = path.split("/")[-1]
    # Exclude files by name
    if filename in EXCLUDE_FILES:
        return False
    # Exclude by extension
    dot_idx = filename.rfind(".")
    ext = filename[dot_idx:].lower() if dot_idx != -1 else ""
    if ext in EXCLUDE_EXTENSIONS or filename.startswith(".env"):
        return False
    # Exclude entire subtrees
    for excl in EXCLUDE_DIRS:
        if f"/{excl}" in f"/{path}":
            return True if False else False  # always exclude
    for excl in EXCLUDE_DIRS:
        if path.startswith(excl) or f"/{excl}" in path:
            return False
    # Include root-level known entry files
    if "/" not in path and filename in INCLUDE_FILENAMES:
        return True
    # Include files with matching extension inside known directories
    if ext in INCLUDE_EXTENSIONS:
        for prefix in INCLUDE_PATHS:
            if path.startswith(prefix) or f"/{prefix}" in path:
                return True
        # Root-level files with valid extension
        if "/" not in path:
            return True
    return False


def fetch_repo_bundle(github_url: str) -> str:
    """
    Fetch relevant code files from a public GitHub repo and return them as
    a bundled string. Returns an ERROR: prefixed string on failure.
    """
    try:
        owner, repo = _parse_github_url(github_url)
    except ValueError as e:
        return f"ERROR: {e}"

    # Try main branch, fall back to master
    tree_data = None
    for branch in ("main", "master"):
        tree_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1"
        try:
            print(f"[github] Trying branch '{branch}' for {owner}/{repo}")
            tree_data = _get(tree_url)
            total_files = len(tree_data.get("tree", []))
            print(f"[github] Tree fetched — {total_files} total entries on branch '{branch}'")
            break
        except urllib.error.HTTPError as e:
            if e.code == 404:
                print(f"[github] Branch '{branch}' not found (404), trying next...")
                continue
            return f"ERROR: GitHub API error fetching tree: {e.code} {e.reason}"
        except Exception as e:
            return f"ERROR: Failed to fetch repository tree: {e}"

    if tree_data is None:
        return f"ERROR: Repository '{owner}/{repo}' not found or is private."

    # Filter to blobs we want to include
    all_blobs = [item for item in tree_data.get("tree", []) if item.get("type") == "blob"]
    blobs = [item for item in all_blobs if _should_include(item["path"])]
    print(f"[github] File filter: {len(blobs)} included / {len(all_blobs)} total blobs")

    bundle_parts: list[str] = []
    total_chars = 0

    for item in blobs:
        if total_chars >= CHAR_BUDGET:
            print(f"[github] Character budget ({CHAR_BUDGET:,}) reached — stopping early")
            break
        path = item["path"]
        sha = item["sha"]
        blob_url = f"https://api.github.com/repos/{owner}/{repo}/git/blobs/{sha}"
        try:
            blob = _get(blob_url)
            encoding = blob.get("encoding", "")
            content_raw = blob.get("content", "")
            if encoding == "base64":
                # GitHub splits base64 across lines — remove newlines before decoding
                content = base64.b64decode(content_raw.replace("\n", "")).decode("utf-8", errors="replace")
            else:
                content = content_raw
            print(f"[github]   + {path} ({len(content):,} chars)")
        except Exception as e:
            content = f"[Could not fetch file: {e}]"
            print(f"[github]   ! {path} — fetch error: {e}")

        section = f"=== FILE: {path} ===\n{content}\n"
        remaining = CHAR_BUDGET - total_chars
        if len(section) > remaining:
            section = section[:remaining]
            print(f"[github]   ~ {path} truncated to fit budget")
        bundle_parts.append(section)
        total_chars += len(section)

    if not bundle_parts:
        return f"ERROR: No readable source files found in '{owner}/{repo}'."

    print(f"[github] Bundle complete — {len(bundle_parts)} files, {total_chars:,} chars total")
    return "\n".join(bundle_parts)
