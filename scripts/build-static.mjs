import { readdir, mkdir, copyFile, rm } from 'node:fs/promises'; // Use Node's built-in file tools without a frontend framework.
import { join, extname } from 'node:path'; // Resolve asset paths consistently across operating systems.
const output = 'dist'; // Keep server functions and packages out of the public website folder.
const excluded = new Set(['dist', 'node_modules', 'netlify', 'scripts', 'tests']); // Exclude implementation and build folders from public assets.
const extensions = new Set(['.html', '.css', '.js', '.json', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.ico', '.avif', '.mp4', '.webm', '.woff', '.woff2', '.ttf', '.otf', '.txt', '.xml', '.pdf', '.webmanifest']); // Preserve ordinary website assets and existing image folders.
await rm(output, { recursive: true, force: true }); // Clear only this script's generated output directory.
async function copyAssets(source, destination) { // Copy the existing static site without requiring a redesign or framework.
  await mkdir(destination, { recursive: true }); // Create each corresponding public directory.
  for (const entry of await readdir(source, { withFileTypes: true })) { // Inspect the current directory's assets.
    if (entry.name.startsWith('.') || excluded.has(entry.name) || ['package.json', 'package-lock.json', 'REVIEW-SETUP.md'].includes(entry.name)) continue; // Exclude private tooling and package metadata.
    const from = join(source, entry.name), to = join(destination, entry.name); // Pair source and output paths.
    if (entry.isDirectory()) await copyAssets(from, to); // Retain the existing nested mascot, gallery and airplane folders.
    else if (entry.isFile() && (extensions.has(extname(entry.name).toLowerCase()) || ['_redirects', '_headers'].includes(entry.name))) await copyFile(from, to); // Publish only ordinary assets and optional Netlify static rules.
  } // Finish copying one directory.
} // End the recursive static build.
await copyAssets('.', output); // Prepare the unchanged plain HTML/CSS/JS site for Netlify.
