document.getElementById('bookingForm')?.addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('bname').value;
  const email = document.getElementById('bemail').value;
  const phone = document.getElementById('bphone').value;
  const date = document.getElementById('bdate').value;
  const time = document.getElementById('btime').value;
  const guests = document.getElementById('bguests').value;
  const message = document.getElementById('bmessage').value;

  const booking = {
    name,
    email,
    phone,
    date,
    time,
    guests,
    message
  };

  // Save in localStorage with key like booking_email
  localStorage.setItem(`booking_${email}`, JSON.stringify(booking));

  const successMsg = document.getElementById('bookingSuccess');
  successMsg.style.display = 'block';

  setTimeout(() => {
    document.getElementById('bookingForm').reset();
    successMsg.style.display = 'none';
    alert("Thank you! Your table is booked.");
  }, 2500);
});

function goHome() {
  window.location.href = "index.html"; // adjust if needed
}
