# Qraft (Quality Management Suite)

<p align="center">
  <img src="./docs/images/qraft_logo.png" alt="Qraft Banner" width="800">
</p>p>

<p align="center">
  <a href="https://github.com/junichi-muraoka/ut-qms/actions/workflows/ci.yml">
      <img src="https://github.com/junichi-muraoka/ut-qms/actions/workflows/ci.yml/badge.svg" alt="CI Status">
  </a>a>
    <a href="https://github.com/junichi-muraoka/ut-qms/actions/workflows/deploy.yml">
        <img src="https://github.com/junichi-muraoka/ut-qms/actions/workflows/deploy.yml/badge.svg" alt="Deploy Status">
    </a>a>
      <img src="https://img.shields.io/badge/License-ISC-blue.svg" alt="License">
        <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome">
</p>p>

---

Qraft is a quality management suite for visualizing and centrally managing "quality" in software development. Adopting a modern tech stack (React 19 and Hono), it achieves ultra-fast response performance in edge environments.

## Key Features

- **Quality Visualization**: Beautifully graph test pass rates and defect densities with Recharts.
- - **Quality Gate**: Automatically block merging of low-quality code in coordination with CI/CD.
  - - **Edge Native**: Next-generation management tool running on Cloudflare Workers / Pages.
    - - **Monorepo**: Centrally manage front-end, back-end, and shared types in a single repository.
     
      - ## Tech Stack
     
      - ### Frontend
      - - **React 19**: High-efficiency UI development utilizing the latest features (React Compiler, etc.).
        - - **Vite and Recharts**: Fast builds and sophisticated data visualization.
          - - **Vitest**: Fast test runner ensuring reliability.
           
            - ### Backend
            - - **Hono**: Ultra-lightweight and highly extensible framework specialized for serverless environments.
              - - **Drizzle ORM and Cloudflare D1**: Type-safe operations and edge persistence.
                - - **Zod**: Robust validation from backend to frontend.
                 
                  - ## Project Structure
                 
                  - ```text
                    .
                    -- client/          # Frontend (React / Vite)
                    -- server/          # Backend (Hono / Workers)
                    -- shared/          # Shared type definitions/validation (TypeScript / Zod)
                    -- e2e/             # E2E tests (Playwright)
                    -- docs/            # Development manuals/environment definitions
                    -- scripts/         # Utilities for development and operations
                    ```

                    ## Quick Start

                    ### 1. Setup
                    After cloning the repository, install dependencies.
                    ```bash
                    npm install
                    ```

                    ### 2. Start Development Server
                    Front and back can be started individually.

                    | Target | Command | Details |
                    | :--- | :--- | :--- |
                    | **Backend** | `npm run server` | Start API on Port 3000 |
                    | **Frontend** | `npm run client` | Start Vite dev server |

                    ## Execution Environments

                    Automatically deployed to each environment via GitHub Actions.

                    | Environment | Target | Branch | Access URL |
                    | :--- | :--- | :--- | :--- |
                    | **Production** | `qraft` | `main` | [qraft.pages.dev](https://qraft.pages.dev) |
                    | **Staging** | `qraft-staging` | `develop` | [qraft-staging.pages.dev](https://qraft-staging.pages.dev) |

                    See [Execution Environments (Details)](./docs/environments.md) for more info.

                    ## Development Workflow

                    1. **Issue Selection**: Select assigned tasks from GitHub Issues.
                    2. 2. **Branch Creation**: Create `feature/...` or `fix/...`.
                       3. 3. **Test Implementation**: Confirm `npm run test` passes.
                          4. 4. **Pull Request**: Pass GitHub Actions checks and merge.
                            
                             5. Refer to the [Development Workflow Guide](./docs/development_workflow.md) for details.
                            
                             6. ---
                             7. <p align="center">
                               Maintained by <b><a href="https://github.com/junichi-muraoka">junichi-muraoka</a></b>
                               </p>
                               
