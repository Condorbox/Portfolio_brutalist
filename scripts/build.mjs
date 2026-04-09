import fs from 'fs/promises';
import path from 'path';

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtmlText(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtmlAttr(value) {
  return escapeHtmlText(value).replace(/"/g, '&quot;');
}

function extractAttributeValues(html, attributeName) {
  const pattern = new RegExp(`${escapeRegExp(attributeName)}\\s*=\\s*"([^"]+)"`, 'g');
  const values = new Set();
  for (const match of html.matchAll(pattern)) {
    values.add(match[1]);
  }
  return [...values].sort();
}

async function readJson(filePath) {
  const contents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(contents);
}

async function copyFileIntoDist(rootDir, distDir, filePath) {
  await fs.copyFile(path.join(rootDir, filePath), path.join(distDir, filePath));
}

async function copyDirIntoDist(rootDir, distDir, dirPath) {
  const srcDir = path.join(rootDir, dirPath);
  const destDir = path.join(distDir, dirPath);
  await fs.mkdir(destDir, { recursive: true });

  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      await copyDirIntoDist(rootDir, distDir, path.join(dirPath, entry.name));
      continue;
    }

    if (entry.isFile()) {
      await fs.copyFile(src, dest);
    }
  }
}

function setHtmlLang(html, locale) {
  return html.replace(/<html\s+lang="[^"]*"/, `<html lang="${escapeHtmlAttr(locale)}"`);
}

function replaceTextKey(html, key, value) {
  const pattern = new RegExp(
    `(<([a-zA-Z0-9-]+)[^>]*\\sdata-i18n="${escapeRegExp(key)}"[^>]*>)([^<]*)(</\\2>)`,
    'g'
  );

  let replacements = 0;
  const nextHtml = html.replace(pattern, (_match, open, _tagName, _inner, close) => {
    replacements += 1;
    return `${open}${escapeHtmlText(value)}${close}`;
  });

  if (replacements === 0) {
    throw new Error(`Could not apply translation for data-i18n="${key}".`);
  }

  return nextHtml;
}

function replacePlaceholderKey(html, key, value) {
  const pattern = new RegExp(
    `<([a-zA-Z0-9-]+)([^>]*\\sdata-i18n-placeholder="${escapeRegExp(key)}"[^>]*)>`,
    'g'
  );

  let replacements = 0;
  const nextHtml = html.replace(pattern, (_match, tagName, attrs) => {
    replacements += 1;
    const escapedValue = escapeHtmlAttr(value);
    let nextAttrs = attrs;

    if (/\splaceholder\s*=/.test(nextAttrs)) {
      nextAttrs = nextAttrs.replace(/\splaceholder\s*=\s*"[^"]*"/, ` placeholder="${escapedValue}"`);
    } else {
      nextAttrs = `${nextAttrs} placeholder="${escapedValue}"`;
    }

    return `<${tagName}${nextAttrs}>`;
  });

  if (replacements === 0) {
    throw new Error(`Could not apply translation for data-i18n-placeholder="${key}".`);
  }

  return nextHtml;
}

function setSelectedLanguageOption(html, locale) {
  const withoutSelected = html.replace(
    /<option([^>]*?)\sselected(?:="selected")?([^>]*?)>/g,
    '<option$1$2>'
  );

  const optionPattern = new RegExp(
    `<option([^>]*\\svalue="${escapeRegExp(locale)}"[^>]*)>`,
    'g'
  );

  let replacements = 0;
  const nextHtml = withoutSelected.replace(optionPattern, (_match, attrs) => {
    replacements += 1;
    return `<option${attrs} selected>`;
  });

  if (replacements === 0) {
    throw new Error(`Could not select language option for locale "${locale}".`);
  }

  return nextHtml;
}

function setCvHref(html, locale) {
  const pattern = /<a([^>]*\sid="cv-download"[^>]*)>/g;
  const href = `/files/Manuel Martínez cv_${locale}.pdf`;

  let replacements = 0;
  const nextHtml = html.replace(pattern, (_match, attrs) => {
    replacements += 1;
    const escapedHref = escapeHtmlAttr(href);
    let nextAttrs = attrs;

    if (/\shref\s*=/.test(nextAttrs)) {
      nextAttrs = nextAttrs.replace(/\shref\s*=\s*"[^"]*"/, ` href="${escapedHref}"`);
    } else {
      nextAttrs = `${nextAttrs} href="${escapedHref}"`;
    }

    return `<a${nextAttrs}>`;
  });

  if (replacements === 0) {
    throw new Error('Could not set CV download link href.');
  }

  return nextHtml;
}

function setDataAttrById(html, id, attributeName, attributeValue) {
  const pattern = new RegExp(
    `<([a-zA-Z0-9-]+)([^>]*\\sid="${escapeRegExp(id)}"[^>]*)>`,
    'g'
  );

  let replacements = 0;
  const nextHtml = html.replace(pattern, (_match, tagName, attrs) => {
    replacements += 1;
    const escapedValue = escapeHtmlAttr(attributeValue);
    const attrPattern = new RegExp(`\\s${escapeRegExp(attributeName)}\\s*=\\s*"[^"]*"`);

    let nextAttrs = attrs;
    if (attrPattern.test(nextAttrs)) {
      nextAttrs = nextAttrs.replace(attrPattern, ` ${attributeName}="${escapedValue}"`);
    } else {
      nextAttrs = `${nextAttrs} ${attributeName}="${escapedValue}"`;
    }

    return `<${tagName}${nextAttrs}>`;
  });

  if (replacements === 0) {
    throw new Error(`Could not set ${attributeName} on #${id}.`);
  }

  return nextHtml;
}

async function main() {
  const rootDir = process.cwd();
  const distDir = path.join(rootDir, 'dist');
  const templatePath = path.join(rootDir, 'index.html');
  const localesDir = path.join(rootDir, 'locales');

  const templateHtml = await fs.readFile(templatePath, 'utf8');

  const textKeys = extractAttributeValues(templateHtml, 'data-i18n');
  const placeholderKeys = extractAttributeValues(templateHtml, 'data-i18n-placeholder');
  const requiredKeys = new Set([...textKeys, ...placeholderKeys]);

  const localeFiles = (await fs.readdir(localesDir))
    .filter((filename) => filename.endsWith('.json'))
    .sort();

  const locales = localeFiles.map((filename) => path.basename(filename, '.json'));
  if (!locales.includes('en')) {
    throw new Error('Expected locales/en.json to exist.');
  }

  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(distDir, { recursive: true });

  await copyFileIntoDist(rootDir, distDir, 'styles.css');
  await copyFileIntoDist(rootDir, distDir, 'script.js');
  await copyFileIntoDist(rootDir, distDir, 'localization.js');
  await copyDirIntoDist(rootDir, distDir, 'files');

  for (const locale of locales) {
    const translations = await readJson(path.join(localesDir, `${locale}.json`));
    const missingKeys = [...requiredKeys].filter((key) => !(key in translations));
    if (missingKeys.length > 0) {
      throw new Error(
        `Missing translation keys in locales/${locale}.json: ${missingKeys.join(', ')}`
      );
    }

    if (!translations.sending_message || !translations.message_sent_success || !translations.message_sent_error) {
      throw new Error(
        `Missing required dynamic-message keys in locales/${locale}.json: sending_message, message_sent_success, message_sent_error`
      );
    }

    let localizedHtml = templateHtml;
    localizedHtml = setHtmlLang(localizedHtml, locale);

    for (const key of textKeys) {
      localizedHtml = replaceTextKey(localizedHtml, key, translations[key]);
    }

    for (const key of placeholderKeys) {
      localizedHtml = replacePlaceholderKey(localizedHtml, key, translations[key]);
    }

    localizedHtml = setSelectedLanguageOption(localizedHtml, locale);
    localizedHtml = setCvHref(localizedHtml, locale);

    localizedHtml = setDataAttrById(
      localizedHtml,
      'contactForm',
      'data-sending-text',
      translations.sending_message
    );
    localizedHtml = setDataAttrById(
      localizedHtml,
      'contactForm',
      'data-success-text',
      translations.message_sent_success
    );
    localizedHtml = setDataAttrById(
      localizedHtml,
      'contactForm',
      'data-error-text',
      translations.message_sent_error
    );

    const outputPath =
      locale === 'en'
        ? path.join(distDir, 'index.html')
        : path.join(distDir, locale, 'index.html');

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, localizedHtml, 'utf8');
  }

  console.log(`Built ${locales.length} locale page(s) into dist/`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
