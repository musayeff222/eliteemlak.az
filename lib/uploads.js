const fs = require("fs");
const path = require("path");

/**
 * Hostinger: app lives in .../hbuilds/versions/<id>/nodejs
 * Uploads go to .../domains/eliteemlak.az/uploads  (survives redeploy)
 */
function resolveUploadDir() {
  if (process.env.UPLOAD_DIR) {
    return path.resolve(process.env.UPLOAD_DIR);
  }
  const marker = `${path.sep}hbuilds${path.sep}`;
  if (__dirname.includes(marker)) {
    const domainRoot = __dirname.split(marker)[0];
    return path.join(domainRoot, "uploads");
  }
  return path.join(__dirname, "..", "uploads");
}

function getUploadUrlPrefix() {
  return (process.env.UPLOAD_URL_PREFIX || "/uploads").replace(/\/$/, "") || "/uploads";
}

function ensureUploadDir() {
  const dir = resolveUploadDir();
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function publicUrlFor(filename) {
  return `${getUploadUrlPrefix()}/${filename}`;
}

module.exports = {
  resolveUploadDir,
  getUploadUrlPrefix,
  ensureUploadDir,
  publicUrlFor,
};
