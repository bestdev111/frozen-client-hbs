((cash) => {
  cash('#consultation-notes-form').on('submit', (event) => {
    const paragraphs = event.target
      .querySelector('.ck.ck-content')
      .querySelectorAll('p');
    
      paragraphs.forEach((p) => {
        cash(`<input type="hidden" name="notes" value="${p.textContent}" \>`).appendTo(event.target);
      });
  });
})(cash);
