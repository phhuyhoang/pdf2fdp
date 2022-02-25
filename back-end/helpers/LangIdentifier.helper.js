const _ = require('lodash');
const XRegExp = require('xregexp');


/**
 * Language identifier tool
 */
class LanguageIdentifier {
  static xre = {
    // TODO: Add language for this
    jp: '\\p{Hiragana}|\\p{Katakana}',
    cn: '\\p{Han}',
    ru: '\\p{Cyrillic}',
    kr: '\\p{Hangul}',
    th: '\\p{Thai}',
    vi: /^[ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s\W|_]+$/gi,
    en: /^[A-z0-9\s\W|_]+$/,
  }

  static nospecial = /^[^*|\":<>[\]{}`\\()';@&$\?\!\.,=\-_^%#]+$/;

  static identify(string) {
    return _.findKey(_.omit(this.xre, 'en'), re => _.split(string, '').some(ch => XRegExp(re).test(ch))) || 'en';
  }

  static havingSpecial(string) {
    return !Boolean(this.nospecial.exec(string));
  }

  static havingHumanLetter(string) {
    const matchAnyLanguages = _.values(this.xre).some(re => XRegExp(re).exec(string));
    return Boolean(matchAnyLanguages);
  }

  static isHumanLanguage(string) {
    const matchAnyLanguages = this.havingHumanLetter(string);
    const withoutSpecial = this.nospecial.exec(string);
    return Boolean(matchAnyLanguages) && Boolean(withoutSpecial);
  }

  static isIntricated(string) {
    const matchAnyLanguages = this.havingHumanLetter(string);
    const havingSpecial = this.havingSpecial(string);
    return matchAnyLanguages && havingSpecial;
  }

  static isLanguage(lang, string) {
    try {
      const matchLanguage = _.get(this.xre, lang)?.exec(string);
      return Boolean(matchLanguage);
    }
    catch(e) { return false; }
  }
}


module.exports = LanguageIdentifier;
