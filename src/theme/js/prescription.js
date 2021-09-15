import axios from 'axios';
import Toastify from "toastify-js";

((cash) => {
  cash('#add-product-form').on('submit', (event) => {
    const product = cash('#product').val();
    const unit = cash('#unit').val();
    const dosage = cash('#dosage').val();
    const duration = cash('#duration').val();
    const quantity = cash('#quantity').val();
    const container = cash('#items-container');
    const inputsContainer = cash('#inputs-container');
    const items = container.children('tr');
    const count = items.length;

    const html = `
    <tr>
      <td class="border-b dark:border-dark-5">${ count + 1 }</td>
      <td class="border-b dark:border-dark-5">${ product }</td>
      <td class="border-b dark:border-dark-5">${dosage} ${ unit }(s) ${quantity} fois par jour</td>
      <td class="border-b dark:border-dark-5">${ duration }${duration ? ' jour(s)' : ''}</td>
    <tr>
    `;

    const inputHtml = `
      <input name="produit${count}" id="produit${count}" value="${product}" type="hidden">
      <input name="unite${count}" id="unite${count}" value="${unit}" type="hidden">
      <input name="quantite${count}" id="quantite${count}" value="${quantity}" type="hidden">
      <input name="dosage${count}" id="dosage${count}" value="${dosage}" type="hidden">
      <input name="duree${count}" id="duree${count}" value="${duration}" type="hidden">
    `;

    cash('#items-count').val(count + 1);
    cash(html).appendTo(container);
    cash(inputHtml).appendTo(inputsContainer);
    document.getElementById('add-product-form')?.reset();
    event.preventDefault();
  });

  cash('#submit-prescription').on('click', async () => {
    const count = cash('#items-count').val();
    const prescription = {
      consultationId: cash('#consultation-id').val(),
      departmentId: cash('#department-id').val(),
      date: new Date(),
      items: []
    };

    for (let i = 0; i < count; i++) {
      const item = {
        quantite: cash(`#quantite${i}`).val(),
        produit: cash(`#produit${i}`).val(),
        unite: cash(`#unite${i}`).val(),
        dosage: cash(`#dosage${i}`).val(),
        duree: cash(`#duree${i}`).val(),
      };
      prescription.items.push(item);
    }

    const { data } = await axios.put('/prescriptions', prescription);
    
    if (data.result === 'Ok') {
      Toastify({
        node: cash("#success-notification-content")
            .clone()
            .removeClass("hidden")[0],
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
      }).showToast();

     cash(`
      <div class="px-5">
        <div class="font-medium text-lg">Prescription</div>
        <div class="table">
            <table class="table">
                <thead>
                <tr>
                    <!-- <th class="border-b-2 dark:border-dark-5 whitespace-nowrap">#</th> -->
                    <th class="border-b-2 dark:border-dark-5 whitespace-nowrap">Produit</th>
                    <th class="border-b-2 dark:border-dark-5 whitespace-nowrap">Dosage</th>
                    <th class="border-b-2 dark:border-dark-5 whitespace-nowrap">Pendant x jours</th>
                </tr>
                </thead>
                <tbody>
                    ${
                      prescription.items.map(item => {
                        return (
                          `
                            <tr>
                            <td>${ item.produit }</td>
                            <td>${ item.quantite } ${ item.unite } ${ item.dosage } fois par jour</td>
                            <td>${ item.duree }</td>
                            </tr>
                          `
                        );
                      })
                    }
                </tbody>
            </table>
        </div>
        <div class="flex items-center mt-5">
            <div class="px-3 py-2 bg-theme-14 dark:bg-dark-5 dark:text-gray-300 text-theme-10 rounded font-medium">${ prescription.date }</div>
        </div>
      </div>
      `).appendTo('#prescriptions');
    } else {
      Toastify({
        node: cash("#failed-notification-content")
            .clone()
            .removeClass("hidden")[0],
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
      }).showToast();
    }
  });
})(cash);
