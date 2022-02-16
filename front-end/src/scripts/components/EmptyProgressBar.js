/**
 * Create an empty stated progress bar
 */
function EmptyProgressBar() {
  const ProgressBarDivElement = document.createElement('div')
    .setClass('progress-bar');
  
  const Span = document.createElement('span')
    .setParent(ProgressBarDivElement);

  const TextNode = document.createTextNode('No file selected')
    .setParent(Span);

  ProgressBarDivElement.$span = Span;
  ProgressBarDivElement.$text = TextNode;

  ProgressBarDivElement.setClass('progress-bar empty-bar');

  return ProgressBarDivElement;
}


module.exports = EmptyProgressBar;
