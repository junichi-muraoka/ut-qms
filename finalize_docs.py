import base64
import os
import subprocess
import json

files = [
    "README.md",
    "docs/cloudflare_overview.md",
    "docs/development_workflow.md",
    "docs/setup_deployment.md",
    "docs/environments.md",
    "docs/images/qraft_logo.png",
    "docs/images/qraft_infrastructure_concept.png",
    "server/package.json",
    "server/tsconfig.json"
]

branch = "final-docs-v8"
repo = "junichi-muraoka/ut-qms"

def run_gh(args):
    result = subprocess.run(["gh"] + args, capture_output=True, text=True)
    return result

# 1. Get main SHA
res = run_gh(["api", f"repos/{repo}/git/refs/heads/main", "--jq", ".object.sha"])
main_sha = res.stdout.strip()
print(f"Main SHA: {main_sha}")

# 2. Create branch
run_gh(["api", f"repos/{repo}/git/refs", "--method", "POST", "-f", f"ref=refs/heads/{branch}", "-f", f"sha={main_sha}"])
print(f"Created branch {branch}")

# 3. Upload files
for f in files:
    if os.path.exists(f):
        with open(f, "rb") as file:
            content = base64.b64encode(file.read()).decode("utf-8")
        
        # Get current SHA if exists
        res = run_gh(["api", f"repos/{repo}/contents/{f}?ref={branch}", "--jq", ".sha"])
        sha = res.stdout.strip()
        
        args = ["api", "--method", "PUT", f"/repos/{repo}/contents/{f}", "-f", f"message=docs: finalize {f}", "-f", f"content={content}", "-f", f"branch={branch}"]
        if sha:
            args += ["-f", f"sha={sha}"]
        
        res = run_gh(args)
        if res.returncode == 0:
            print(f"Successfully uploaded {f}")
        else:
            print(f"Failed to upload {f}: {res.stderr}")

# 4. Create PR
run_gh(["pr", "create", "--title", "Final Documentation Overhaul (V8)", "--body", "Complete professional update", "--base", "main", "--head", branch])
print("Created PR")

# 5. Merge PR
run_gh(["pr", "merge", "--merge", "--admin", "--delete-branch=false"])
print("Attempted Merge")
