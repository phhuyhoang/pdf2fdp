const autoload = require('./helpers/autoload/prototype').init();

const effect = require('./misc/effects');

const ToggleSwitch = require('./components/pricing/ToggleSwitch.component');


const toYearlyPrice = function toYearlyPrice(monthly_price) {
  return monthly_price > 0 ? parseInt(monthly_price * 12 * 0.9) - 0.01 : 0;
}


document.addEventListener('DOMContentLoaded', function onDOMContentLoaded() {
  // Apply pulse click effect
  effect.ripple.applyEffect();

  const topSectionPlan = document.querySelector('.top-section__plans');
  const planCardPricing = document.querySelectorAll('.plan-card__pricing');

  const toggle_switch = new ToggleSwitch().setParent(topSectionPlan);

  toggle_switch.$button_left.textContent = 'Monthly';
  toggle_switch.$button_right.textContent = 'Yearly';
  toggle_switch.$button_left.disableButton();


  toggle_switch.$button_left.addEventListener('click', function changePeriodToMonthly() {

    for (const cardPricing of planCardPricing) {
      const basePrice = cardPricing.firstElementChild.dataset.basePrice;
      const basePeriod = cardPricing.lastElementChild.dataset.basePeriod;
      cardPricing.firstElementChild.textContent = `${parseFloat(basePrice)} USD`;
      cardPricing.lastElementChild.textContent = `/ ${basePeriod}`;
    }

  });

  
  toggle_switch.$button_right.addEventListener('click', function changePeriodToYearly() {

    for (const cardPricing of planCardPricing) {
      const basePrice = cardPricing.firstElementChild.dataset.basePrice;
      cardPricing.firstElementChild.textContent = `${toYearlyPrice(basePrice)} USD`;
      cardPricing.lastElementChild.textContent = '/ year';
    }

  });
})
