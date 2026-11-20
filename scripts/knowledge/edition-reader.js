// Update language links before following them. Each file also works through an ordinary relative URL.
const articles = Array.from(document.querySelectorAll('.kb-chapter'));
for (const link of document.querySelectorAll('a[data-language]')) {
  link.addEventListener('click', () => {
    // The preceding chapter can still end inside the scroll margin. Use the latest heading
    // above the reading line so that its predecessor cannot steal an explicit chapter link.
    const chapter = articles.filter(article => !article.hidden && article.getBoundingClientRect().top <= 72).at(-1);
    link.hash = chapter?.id ?? location.hash;
  });
}
