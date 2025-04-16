/**
 * JSDoc plugin that adds a link to the Chinese README in the generated documentation.
 */
exports.handlers = {
  /**
   * Called after JSDoc has finished parsing all files.
   * @param {Object} e - The event object.
   */
  parseComplete: function(e) {
    const readme = e.doclets.find(doclet => doclet.kind === 'package');
    
    if (readme) {
      // Add link to Chinese README at the top of the main page
      if (readme.description) {
        const chineseReadmeLink = '<div style="margin-bottom: 20px;"><a href="../README.zh_CN.md" style="font-weight: bold; font-size: 1.2em;">🇨🇳 中文文档</a></div>';
        readme.description = chineseReadmeLink + readme.description;
      }
    }
  }
};
