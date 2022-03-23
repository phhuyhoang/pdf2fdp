const autoload = require('./helpers/autoload/prototype').init();

const effect = require('./misc/effects');

const ToggleSwitch = require('./components/pricing/ToggleSwitch');


const toYearlyPrice = function toYearlyPrice(monthly_price) {
  return monthly_price > 0 ? parseInt(monthly_price * 12 * 0.9) - 0.01 : 0;
}


document.addEventListener('DOMContentLoaded', function onDOMContentLoaded() {
  // Apply pulse click effect
  effect.ripple.applyEffect();

  const top_section_plans = document.querySelector('.top-section__plans');
  const plan_card_pricings = document.querySelectorAll('.plan-card__pricing');

  const toggle_switch = new ToggleSwitch().setParent(top_section_plans);

  toggle_switch.$button_left.textContent = 'Monthly';
  toggle_switch.$button_right.textContent = 'Yearly';
  toggle_switch.$button_left.disableButton();


  toggle_switch.$button_left.addEventListener('click', function changePeriodToMonthly() {
    for (const card_pricing of plan_card_pricings) {
      const base_price = card_pricing.firstElementChild.dataset.basePrice;
      const base_period = card_pricing.lastElementChild.dataset.basePeriod;
      card_pricing.firstElementChild.textContent = `${parseFloat(base_price)} USD`;
      card_pricing.lastElementChild.textContent = `/ ${base_period}`;
    }
  });

  
  toggle_switch.$button_right.addEventListener('click', function changePeriodToYearly() {
    for (const card_pricing of plan_card_pricings) {
      const base_price = card_pricing.firstElementChild.dataset.basePrice;
      card_pricing.firstElementChild.textContent = `${toYearlyPrice(base_price)} USD`;
      card_pricing.lastElementChild.textContent = '/ year';
    }
  });
})
