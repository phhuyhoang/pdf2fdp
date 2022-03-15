const _ = require('lodash')
const fs = require('fs');
const configs = require('../configs');
const HandlebarHelpers = require('handlebars-helpers');
const safeStringify = require('json-stringify-safe');
const VerificationCode = require('./VerificationCode.helper');

const helpers = Object.create(null);
JSON.safeStringify = safeStringify;


helpers.env = function environment(options) {
  return configs.env.parsed;
}


helpers.script = function loadJavaScript(filepath, options) {
  const scriptContent = fs.readFileSync(filepath).toString();
  return `<script>${scriptContent}</script>`
}


helpers.style = function loadStylesheet(filepath, options) {
  const stylesheetContent = fs.readFileSync(filepath).toString();
  return `<style>${stylesheetContent}</style>`
}


helpers.convertToBase64 = function convertToBase64(context, options) {
  return Buffer.from(context).toString('base64');
}


helpers.convertImageToBase64 = function convertImageToBase64(context, options) {
  const buffer = fs.readFileSync(context);
  const data = helpers.convertToBase64(buffer);
  return `data:image/svg+xml;base64,${data}`;
}


helpers.getVerificationCode = function getVerificationCode(options) {
  const request = options.data.root._request;
  return VerificationCode.fromRequest(request)
}


helpers.safeStringify = function safeStringify(context, options) {
  return JSON.safeStringify(context, null, 2);
}


helpers.keysOf = function keysOf(context, options) {
  return Object.keys(context);
}


module.exports = function registerHelpers(groups, options) {
  HandlebarHelpers.call(null, groups, options);

  if (groups.handlebars)
    _.chain(helpers).forOwn((v, k) => groups.handlebars.registerHelper(k.toString(), v)).value();
}
