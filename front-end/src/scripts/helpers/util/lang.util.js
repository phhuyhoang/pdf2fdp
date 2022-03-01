const xrelang = {
  jp: '\\p{Hiragana}|\\p{Katakana}',
  cn: '\\p{Han}',
  ru: '\\p{Cyrillic}',
  kr: '\\p{Hangul}',
  th: '\\p{Thai}',
  vi: /^[ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s\W|_]+$/gi,
  en: /^[A-z0-9\s\W|_]+$/,
};

const xrespec = /^[^*|\":<>[\]{}`\\()';@&$\?\!\.,=\-\/_^%#]+$/;



module.exports.isHumanLanguage = function isHumanLanguage(string) {
  const matchAnyLanguage = 
    Object
      .values(xre)
      .some(re => XRegExp(re).exec(string));

  const noContainsSpecial = nospecial.exec(string);

  return matchAnyLanguage && noContainsSpecial;
}


if ( !(XRegExp?.prototype instanceof RegExp) ) {
  window.alert(`XRegExp: Module not found.`);
  module.exports = {};
}
