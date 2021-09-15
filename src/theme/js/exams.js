const makeHiddenImputFromPreviewContent = (preview, category, form) => {
  preview.querySelectorAll('.has-items')
    .forEach((hasItems) => {
      makeHiddenInputFromItemsContainer(hasItems, category, form);
    });
};

const makeHiddenInputFromItemsContainer = (hasItems, category, form) => {
  hasItems.querySelectorAll('.item')
    .forEach((item) => {
      const value = cash(item).attr('data-value');
      const html = `<input type="hidden" name="category:${category}" value="${value}"/>`
    
      cash(html).appendTo(cash(form));
    });
}

const makeHiddenInput =  (event) => {
  event.target
    .querySelectorAll('.preview')
    .forEach((preview) => {
      const category = cash(preview).attr('data-category');

      makeHiddenImputFromPreviewContent(preview, category, event.target);
    });
}

((cash) => {
  cash('#exams-order-form').on('submit', makeHiddenInput);
  cash('#imagery-exam-order-form').on('submit', makeHiddenInput);
})(cash);
