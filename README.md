<!DOCTYPE html>
<html lang="en">
<body>

<h1>Butterfly</h1>
<p>
  Butterfly is a simple project demonstrating how to run multiple NestJS
  applications in a single repository. It contains three services:
</p>

<ul>
  <li><strong>game-server</strong> – gRPC service under active development</li>
  <li><strong>admin-server</strong> – HTTP API skeleton</li>
  <li><strong>chat-server</strong> – WebSocket skeleton</li>
</ul>

<p>
  Because the scope of the project is small, these services are kept in the same
  repository for easy management. 
</p>

<h2>Repository Layout</h2>
<pre><code>apps/
  game-server/      # main gRPC server
  admin-server/     # not implemented yet
  chat-server/      # not implemented yet
</code></pre>
<pre><code>libs/
  auth/             # Session and jwt utilities
  datahub/          # DB, Redis, in-memory cache modules
  common/           # shared placeholders
</code></pre>
<pre><code>environments/
  local/ # simple docker-compose for local MySQL & Redis
</code></pre>
<pre><code>.github/
  workflows/ # actions. GitOps CI/CD YAML will be added later
</code></pre>

<h2>Quick Start</h2>
<ol>
  <li>Install dependencies</li>
</ol>
<pre><code>pnpm install
</code></pre>

<ol start="2">
  <li>Start local MySQL and Redis</li>
</ol>
<pre><code>cd environments/local
docker-compose up -d
</code></pre>

<ol start="3">
  <li>Run the game server in watch mode</li>
</ol>
<pre><code>pnpm run start:game:dev
</code></pre>

<p>
  Build scripts (<code>pnpm run build:game</code>) and migration commands are available in
  <code>package.json</code> for working with TypeORM.
</p>

<h2>Status</h2>
<p>
  <code>admin-server</code> and <code>chat-server</code> are placeholders. Current work focuses on the
  game server and the shared libraries under <code>libs/</code>.</br>
  <em style="color:gray">This service is still in early development and may not function reliably yet.</em>
</p>

</body>
</html>
