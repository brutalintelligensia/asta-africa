(async () => {
  const params = new URLSearchParams(location.search);
  const reference = params.get('reference');
  const status = params.get('status');
  const title = document.getElementById('result-title');
  const copy = document.getElementById('result-copy');
  const icon = document.getElementById('result-icon');
  const ref = document.getElementById('result-ref');
  if (reference) ref.textContent = `Registration reference: ${reference}`;
  if (status === 'success' && reference) {
    try {
      const response = await fetch(`/api/registrations/${encodeURIComponent(reference)}/status`);
      const data = await response.json();
      if (response.ok && data.status === 'paid') {
        icon.textContent = '✓'; title.textContent = 'Payment confirmed';
        copy.textContent = 'Your payment has been verified by the server. Keep your registration reference for your records.';
      } else {
        icon.textContent = '◷'; title.textContent = 'Payment under review';
        copy.textContent = 'We received your return from checkout, but the server has not confirmed payment yet. Please contact the registration team with your reference.';
      }
    } catch {
      title.textContent = 'Payment status unavailable';
      copy.textContent = 'Please contact the registration team with your reference so they can check the transaction.';
    }
  } else if (status === 'failed') {
    icon.textContent = '!'; title.textContent = 'Payment not completed';
    copy.textContent = 'The payment could not be verified as successful. You can return to the site and try again.';
  } else {
    icon.textContent = '◷'; title.textContent = 'Payment needs a check';
    copy.textContent = 'We could not confirm the payment status automatically. Contact the registration team before making another payment.';
  }
})();