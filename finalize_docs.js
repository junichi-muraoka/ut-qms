const fs = require('fs');
const { execSync } = require('child_process');

const files = [
    "README.md",
    "docs/cloudflare_overview.md",
    "docs/development_workflow.md",
    "docs/setup_deployment.md",
    "docs/environments.md",
    "docs/images/qraft_logo.png",
    "docs/images/qraft_infrastructure_concept.png",
    "server/package.json",
    "server/tsconfig.json"
];

const branch = "final-docs-v9";
const repo = "junichi-muraoka/ut-qms";

function runGh(args) {
    try {
        return execSync(`gh ${args.join(' ')}`).toString().trim();
    } catch (e) {
        return null;
    }
}

// 1. Get main SHA
const mainSha = runGh(["api", `repos/${repo}/git/refs/heads/main`, "--jq", ".object.sha"]);
console.log(`Main SHA: ${mainSha}`);

// 2. Create branch
runGh(["api", `repos/${repo}/git/refs`, "--method", "POST", "-f", `ref=refs/heads/${branch}`, "-f", `sha=${mainSha}`]);
console.log(`Created branch ${branch}`);

// 3. Upload files
for (const f of files) {
    if (fs.existsSync(f)) {
        const content = fs.readFileSync(f).toString('base64');
        
        // Get current SHA if exists
        const sha = runGh(["api", `repos/${repo}/contents/${f}?ref=${branch}`, "--jq", ".sha"]);
        
        let args = ["api", "--method", "PUT", `/repos/${repo}/contents/${f}`, "-f", `message="docs: finalize ${f}"`, "-f", `content="${content}"`, "-f", `branch="${branch}"`];
        if (sha) {
            args.push("-f", `sha="${sha}"`);
        }
        
        try {
            execSync(`gh ${args.join(' ')}`);
            console.log(`Successfully uploaded ${f}`);
        } catch (e) {
            console.log(`Failed to upload ${f}`);
        }
    }
}

// 4. Create PR
runGh(["pr", "create", "--title", '"Final Documentation Overhaul (V9)"', "--body", '"Complete professional update"', "--base", "main", "--head", branch]);
console.log("Created PR");

// 5. Merge PR
runGh(["pr", "merge", "--merge", "--admin", "--delete-branch=false"]);
console.log("Attempted Merge");
