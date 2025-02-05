// script.js

document.addEventListener("DOMContentLoaded", () => {
    const sellerTable = document.querySelector(".sellers-container table");
  
    // Event delegation for handling button clicks
    sellerTable.addEventListener("click", (event) => {
      const target = event.target;
  
      if (target.classList.contains("view")) {
        handleView(target);
      } else if (target.classList.contains("edit")) {
        handleEdit(target);
      } else if (target.classList.contains("delete")) {
        handleDelete(target);
      }
    });
  
    // Function to handle the View button
    function handleView(button) {
      const row = button.closest("tr");
      const sellerName = row.querySelector("td:nth-child(1)").textContent;
      const sellerEmail = row.querySelector("td:nth-child(2)").textContent;
      alert(`Viewing details for: \nName: ${sellerName} \nEmail: ${sellerEmail}`);
      // You can add logic to open a modal or navigate to a detailed page
    }
  
    // Function to handle the Edit button
    function handleEdit(button) {
      const row = button.closest("tr");
      const sellerName = row.querySelector("td:nth-child(1)").textContent;
      const sellerEmail = row.querySelector("td:nth-child(2)").textContent;
      const newName = prompt("Edit Seller Name:", sellerName);
      const newEmail = prompt("Edit Seller Email:", sellerEmail);
  
      if (newName && newEmail) {
        row.querySelector("td:nth-child(1)").textContent = newName;
        row.querySelector("td:nth-child(2)").textContent = newEmail;
        alert("Seller details updated successfully.");
      }
    }
  
    // Function to handle the Delete button
    function handleDelete(button) {
      const row = button.closest("tr");
      const sellerName = row.querySelector("td:nth-child(1)").textContent;
      const confirmDelete = confirm(`Are you sure you want to delete ${sellerName}?`);
  
      if (confirmDelete) {
        row.remove();
        alert(`${sellerName} has been deleted.`);
      }
    }
  });
  