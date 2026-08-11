import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const json = (value) => JSON.stringify(value, null, 2);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function sortedFiles(dir, extension) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map((entry) => path.join(dir, entry.name))
    .sort();
}

function relative(repoRoot, file) {
  return path.relative(repoRoot, file).replaceAll(path.sep, '/');
}

function hashFiles(repoRoot, files) {
  const hash = crypto.createHash('sha256');
  for (const file of files) {
    hash.update(relative(repoRoot, file));
    hash.update('\0');
    hash.update(fs.readFileSync(file));
    hash.update('\0');
  }
  return hash.digest('hex');
}

export function collectMcpSourceFiles(repoRoot) {
  const componentDir = path.join(repoRoot, 'design-source', 'components');
  const previewDir = path.join(repoRoot, 'design-source', 'preview');
  const specDir = path.join(repoRoot, 'design-source', 'specs');

  return [
    path.join(repoRoot, 'design-source', 'README.md'),
    path.join(repoRoot, 'design-source', 'colors_and_type.css'),
    path.join(repoRoot, 'design-source', 'components.css'),
    ...sortedFiles(componentDir, '.json'),
    ...sortedFiles(previewDir, '.html'),
    ...sortedFiles(specDir, '.json'),
  ].filter((file) => fs.existsSync(file));
}

export function createMcpManifest(repoRoot, model) {
  const sourceFiles = collectMcpSourceFiles(repoRoot);
  const packageJson = readJson(path.join(repoRoot, 'package.json'));
  const componentIndex = readJson(
    path.join(repoRoot, 'design-source', 'components', 'index.json'),
  );

  return {
    schemaVersion: 1,
    name: 'com-design-mcp',
    designSystem: 'Com Design Mobile',
    version: packageJson.version,
    transport: 'stdio',
    source: 'design-source/',
    sourceHash: hashFiles(repoRoot, sourceFiles),
    tokenSourceHash: model.sourceHash,
    componentCount: componentIndex.components.length,
    tools: [
      'com_list',
      'com_info',
      'com_doc',
      'com_preview',
      'com_token',
      'com_design_md',
      'com_semantic',
    ],
  };
}

export function createMcpTokenData(model) {
  return {
    schemaVersion: 1,
    sourceHash: model.sourceHash,
    tokens: model.consumer.map((token) => ({
      name: token.name,
      key: token.key,
      type: token.type,
      light: token.light,
      dark: token.dark,
      hasDarkOverride: token.hasDarkOverride,
    })),
    scopes: model.scopes,
  };
}

export function createMcpPackageJson(version) {
  return {
    name: '@com-design/mcp',
    version,
    private: true,
    type: 'module',
    description: 'Generated local MCP server for Com Design Mobile',
    engines: { node: '>=18' },
    scripts: { start: 'node server.mjs' },
    dependencies: {
      '@modelcontextprotocol/sdk': '1.30.0',
      zod: '3.25.76',
    },
  };
}

export function createMcpReadme(manifest) {
  return `# Com Design MCP\n\nGenerated from the same \`design-source/\` revision as the Com Design engineering outputs. Do not edit the generated data by hand.\n\n- Design System: ${manifest.designSystem}\n- Version: ${manifest.version}\n- Source hash: \`${manifest.sourceHash}\`\n- Transport: stdio\n- Tools: ${manifest.tools.join(', ')}\n\n## Run\n\n\`\`\`bash\nnpm install\nnpm start\n\`\`\`\n\n## MCP host configuration\n\nPoint your MCP host at the downloaded directory's \`server.mjs\`:\n\n\`\`\`json\n{\n  "mcpServers": {\n    "com-design": {\n      "command": "node",\n      "args": ["/absolute/path/to/com-design-mcp/server.mjs"]\n    }\n  }\n}\n\`\`\`\n\nThe package is intentionally read-only. It exposes Com Design knowledge to agents; it does not generate UI, mutate projects, or write back to the design system.\n`;
}

export function createMcpServer(manifest) {
  return `#!/usr/bin/env node\nimport fs from 'node:fs';\nimport { fileURLToPath } from 'node:url';\nimport path from 'node:path';\nimport { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';\nimport { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';\nimport { z } from 'zod';\n\nconst here = path.dirname(fileURLToPath(import.meta.url));\nconst dataRoot = path.join(here, 'data');\nconst readText = (relativePath) => fs.readFileSync(path.join(dataRoot, relativePath), 'utf-8');\nconst readJson = (relativePath) => JSON.parse(readText(relativePath));\nconst componentIndex = readJson('components/index.json');\nconst tokenData = readJson('tokens.json');\nconst buildManifest = readJson('mcp-manifest.json');\n\nconst server = new McpServer({\n  name: 'com-design',\n  version: buildManifest.version,\n});\n\nfunction textResult(value) {\n  return {\n    content: [{\n      type: 'text',\n      text: typeof value === 'string' ? value : JSON.stringify(value, null, 2),\n    }],\n  };\n}\n\nfunction errorResult(message) {\n  return { content: [{ type: 'text', text: message }], isError: true };\n}\n\nfunction findComponent(input) {\n  const needle = String(input ?? '').trim().toLowerCase();\n  return componentIndex.components.find((component) =>\n    component.slug.toLowerCase() === needle || component.name.toLowerCase() === needle\n  );\n}\n\nfunction contractFor(component) {\n  return readJson(component.contract);\n}\n\nserver.registerTool('com_list', {\n  title: 'List Com Design components',\n  description: 'List the canonical Com Design component catalog, optionally filtered by category.',\n  inputSchema: { category: z.string().optional() },\n}, async ({ category }) => {\n  const normalized = category?.trim().toLowerCase();\n  const components = componentIndex.components\n    .filter((component) => !normalized || component.category.toLowerCase() === normalized)\n    .map(({ slug, name, category: group }) => ({ slug, name, category: group }));\n  return textResult({ version: componentIndex.version, count: components.length, components });\n});\n\nserver.registerTool('com_info', {\n  title: 'Get Com Design component info',\n  description: 'Get a concise component summary including variants, anatomy, usage rules, and prohibited inventions.',\n  inputSchema: { component: z.string() },\n}, async ({ component }) => {\n  const hit = findComponent(component);\n  if (!hit) return errorResult(\`Unknown Com Design component: \${component}\`);\n  const contract = contractFor(hit);\n  return textResult({\n    slug: hit.slug,\n    name: hit.name,\n    category: hit.category,\n    semanticTypeCandidates: contract.semanticTypeCandidates,\n    variantDimensions: contract.variantDimensions,\n    anatomy: contract.anatomy,\n    usageHints: contract.usageHints,\n    doNotInvent: contract.doNotInvent,\n    unknowns: contract.unknowns,\n  });\n});\n\nserver.registerTool('com_doc', {\n  title: 'Get full Com Design component contract',\n  description: 'Return the complete structured contract JSON for one Com Design component.',\n  inputSchema: { component: z.string() },\n}, async ({ component }) => {\n  const hit = findComponent(component);\n  if (!hit) return errorResult(\`Unknown Com Design component: \${component}\`);\n  return textResult(contractFor(hit));\n});\n\nserver.registerTool('com_preview', {\n  title: 'Get Com Design component preview',\n  description: 'Return the canonical HTML preview for one component so an agent can inspect visual structure and CSS evidence.',\n  inputSchema: { component: z.string() },\n}, async ({ component }) => {\n  const hit = findComponent(component);\n  if (!hit) return errorResult(\`Unknown Com Design component: \${component}\`);\n  return textResult(readText(hit.preview));\n});\n\nserver.registerTool('com_token', {\n  title: 'Query Com Design tokens',\n  description: 'Query normalized consumer tokens by name/key substring, token type, and light or dark theme.',\n  inputSchema: {\n    query: z.string().optional(),\n    type: z.string().optional(),\n    theme: z.enum(['light', 'dark']).default('light'),\n    limit: z.number().int().min(1).max(200).default(50),\n  },\n}, async ({ query, type, theme, limit }) => {\n  const needle = query?.trim().toLowerCase();\n  const tokenType = type?.trim().toLowerCase();\n  const tokens = tokenData.tokens\n    .filter((token) => !tokenType || token.type.toLowerCase() === tokenType)\n    .filter((token) => !needle || token.name.toLowerCase().includes(needle) || token.key.toLowerCase().includes(needle))\n    .slice(0, limit)\n    .map((token) => ({\n      name: token.name,\n      key: token.key,\n      type: token.type,\n      value: theme === 'dark' ? token.dark : token.light,\n      light: token.light,\n      dark: token.dark,\n    }));\n  return textResult({ theme, count: tokens.length, tokens });\n});\n\nserver.registerTool('com_design_md', {\n  title: 'Read Com Design design.md',\n  description: 'Return the human-facing Com Design design system guide used as the high-level agent entry point.',\n  inputSchema: {},\n}, async () => textResult(readText('design.md')));\n\nserver.registerTool('com_semantic', {\n  title: 'Get Com Design component semantics',\n  description: 'Return component anatomy, traits, structural patterns, usage rules, and prohibited inventions without implementation noise.',\n  inputSchema: { component: z.string() },\n}, async ({ component }) => {\n  const hit = findComponent(component);\n  if (!hit) return errorResult(\`Unknown Com Design component: \${component}\`);\n  const contract = contractFor(hit);\n  return textResult({\n    slug: hit.slug,\n    name: hit.name,\n    anatomy: contract.anatomy,\n    traits: contract.traits,\n    structurePatterns: contract.structurePatterns,\n    usageHints: contract.usageHints,\n    doNotInvent: contract.doNotInvent,\n  });\n});\n\nconst transport = new StdioServerTransport();\nawait server.connect(transport);\nconsole.error(\`Com Design MCP \${buildManifest.version} ready (source \${buildManifest.sourceHash.slice(0, 12)})\`);\n\nprocess.on('SIGINT', async () => {\n  await server.close();\n  process.exit(0);\n});\n`;
}

function writeText(target, content) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, 'utf-8');
}

export function writeMcpOutput(repoRoot, model) {
  const outputRoot = path.join(repoRoot, 'dist', 'mcp');
  const dataRoot = path.join(outputRoot, 'data');
  const manifest = createMcpManifest(repoRoot, model);

  fs.rmSync(outputRoot, { recursive: true, force: true });
  fs.mkdirSync(dataRoot, { recursive: true });

  writeText(path.join(outputRoot, 'package.json'), json(createMcpPackageJson(manifest.version)) + '\n');
  writeText(path.join(outputRoot, 'server.mjs'), createMcpServer(manifest));
  writeText(path.join(outputRoot, 'README.md'), createMcpReadme(manifest));
  writeText(path.join(dataRoot, 'mcp-manifest.json'), json(manifest) + '\n');
  writeText(path.join(dataRoot, 'tokens.json'), json(createMcpTokenData(model)) + '\n');

  const designMd = path.join(repoRoot, 'design.md');
  if (fs.existsSync(designMd)) fs.copyFileSync(designMd, path.join(dataRoot, 'design.md'));
  fs.copyFileSync(
    path.join(repoRoot, 'design-source', 'README.md'),
    path.join(dataRoot, 'source-readme.md'),
  );
  fs.copyFileSync(
    path.join(repoRoot, 'design-source', 'colors_and_type.css'),
    path.join(dataRoot, 'colors_and_type.css'),
  );
  fs.copyFileSync(
    path.join(repoRoot, 'design-source', 'components.css'),
    path.join(dataRoot, 'components.css'),
  );
  fs.cpSync(
    path.join(repoRoot, 'design-source', 'components'),
    path.join(dataRoot, 'components'),
    { recursive: true },
  );
  fs.cpSync(
    path.join(repoRoot, 'design-source', 'preview'),
    path.join(dataRoot, 'preview'),
    { recursive: true },
  );
  fs.cpSync(
    path.join(repoRoot, 'design-source', 'specs'),
    path.join(dataRoot, 'specs'),
    { recursive: true },
  );

  return [
    'dist/mcp/package.json',
    'dist/mcp/server.mjs',
    'dist/mcp/README.md',
    'dist/mcp/data/mcp-manifest.json',
    'dist/mcp/data/tokens.json',
    'dist/mcp/data/design.md',
    'dist/mcp/data/source-readme.md',
    'dist/mcp/data/colors_and_type.css',
    'dist/mcp/data/components.css',
    'dist/mcp/data/components/**',
    'dist/mcp/data/preview/**',
    'dist/mcp/data/specs/**',
  ];
}
