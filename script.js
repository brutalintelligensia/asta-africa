const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
menuButton?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
});
navLinks?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));

// Reveal sections as they enter the viewport.
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Keep payment choice styling and manual transfer details in sync.
const paymentRadios = [...document.querySelectorAll('input[name="paymentMethod"]')];
const transferInfo = document.getElementById('transfer-info');
const submitButton = document.getElementById('checkout-submit');
function updatePaymentChoice() {
  const selected = paymentRadios.find(r => r.checked)?.value;
  document.querySelectorAll('.radio-card').forEach(card => {
    card.classList.toggle('selected', card.querySelector('input').checked);
  });
  transferInfo.hidden = selected !== 'transfer';
  submitButton.textContent = selected === 'transfer' ? 'Submit registration details' : 'Continue to secure payment →';
}
paymentRadios.forEach(radio => radio.addEventListener('change', updatePaymentChoice));
updatePaymentChoice();

const form = document.getElementById('registration-form');
const message = document.getElementById('form-message');
form?.addEventListener('submit', async event => {
  event.preventDefault();
  message.textContent = '';
  message.className = 'form-message';
  if (!form.reportValidity()) return;

  const data = Object.fromEntries(new FormData(form).entries());
  const method = data.paymentMethod;
  delete data.paymentMethod;
  submitButton.disabled = true;
  submitButton.textContent = 'Please wait…';

  try {
    const response = await fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, paymentMethod: method })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'We could not process your request. Please try again.');

    if (method === 'paystack') {
      if (!result.authorizationUrl) throw new Error('Online checkout is not configured yet. Please contact the organiser.');
      window.location.assign(result.authorizationUrl);
      return;
    }
    message.className = 'form-message success';
    message.textContent = `Registration received. Your reference is ${result.reference}. Complete the OPay transfer and send proof to the registration team. Your place is pending payment verification.`;
    form.reset();
    updatePaymentChoice();
  } catch (error) {
    message.className = 'form-message error';
    message.textContent = error.message;
  } finally {
    submitButton.disabled = false;
    updatePaymentChoice();
  }
});
