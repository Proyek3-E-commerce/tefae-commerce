// orders.js

document.addEventListener('DOMContentLoaded', () => {
    const ordersTable = document.querySelector('.orders-table tbody');
  
    // Handle View button
    ordersTable.addEventListener('click', (event) => {
      if (event.target.classList.contains('view-btn')) {
        const row = event.target.closest('tr');
        const orderId = row.children[0].textContent;
        const customer = row.children[1].textContent;
        const total = row.children[2].textContent;
        const status = row.children[3].textContent;
  
        alert(`Order Details:\nOrder ID: ${orderId}\nCustomer: ${customer}\nTotal: ${total}\nStatus: ${status}`);
      }
    });
  
    // Handle Update button
    ordersTable.addEventListener('click', (event) => {
      if (event.target.classList.contains('update-btn')) {
        const row = event.target.closest('tr');
        const orderId = row.children[0].textContent;
        const currentStatus = row.children[3].textContent;
  
        const newStatus = prompt(`Update status for Order ID: ${orderId}\nCurrent Status: ${currentStatus}\nEnter new status:`);
  
        if (newStatus) {
          row.children[3].textContent = newStatus;
          alert(`Order ID: ${orderId} status updated to: ${newStatus}`);
        } else {
          alert('Update canceled or invalid input.');
        }
      }
    });
  });
  