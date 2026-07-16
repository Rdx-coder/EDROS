/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import "dotenv/config";

function sanitizeDatabaseUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  try {
    if (!url.startsWith("postgresql://") && !url.startsWith("postgres://")) {
      return url;
    }
    const prefix = url.startsWith("postgresql://") ? "postgresql://" : "postgres://";
    const dynamicPart = url.substring(prefix.length);

    const questionMarkIndex = dynamicPart.indexOf("?");
    let mainPart = questionMarkIndex !== -1 ? dynamicPart.substring(0, questionMarkIndex) : dynamicPart;
    const queryPart = questionMarkIndex !== -1 ? dynamicPart.substring(questionMarkIndex) : "";

    const lastAtClass = mainPart.lastIndexOf("@");
    if (lastAtClass === -1) return url;

    const credentials = mainPart.substring(0, lastAtClass);
    const hostDb = mainPart.substring(lastAtClass + 1);

    const colonIndex = credentials.indexOf(":");
    if (colonIndex === -1) return url;

    const username = credentials.substring(0, colonIndex);
    const password = credentials.substring(colonIndex + 1);

    const decodedPassword = decodeURIComponent(password);
    const encodedPassword = encodeURIComponent(decodedPassword);

    return `${prefix}${username}:${encodedPassword}@${hostDb}${queryPart}`;
  } catch (e) {
    return url;
  }
}

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = sanitizeDatabaseUrl(process.env.DATABASE_URL);
}
